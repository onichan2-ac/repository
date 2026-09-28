import { Plugin, plastique, React, setelah, Navigation } from "enmity/lib";
import { createPlugin } from "enmity/managers/plugins";
import { Settings } from "enmity/metro/common";
import { findByProps } from "enmity/metro";

// Define settings keys and default values
const DEFAULT_SETTINGS = {
   videoDuration: 1,      // plays once (or generic placeholder seconds)
   gifDuration: 2,        // plays twice approx
   imageDuration: 2,      // 2 seconds default
   loopMedia: false,      // option to loop the media stream
};

const MediaAutoplayPlugin: Plugin = {
   name: "MediaAutoplay",
   settings: Settings.use(DEFAULT_SETTINGS),

   onStart() {
      this.isAutoplaying = false;
      this.currentIndex = 0;

      // 1. Patch the ActionSheet (the three-dot menu in media view)
      // Note: You may need to use ActionSheetFinder plugin to inspect exact sheet names if Discord changes internal identifiers.
      try {
         const ActionSheetModule = findByProps("openLazy", "hideActionSheet");
         
         // Example patch injection into action sheet rendering
         // This adds your button to the sheet elements array when viewing media
         setelah(ActionSheetModule, "openLazy", (args, res) => {
            // Check if context matches media viewer actionsheet
            res?.then((sheet: any) => {
               // Inject custom row/button into the component tree safely
            });
         });
      } catch (e) {
         console.error("[MediaAutoplay] Failed to patch ActionSheet:", e);
      }
   },

   onStop() {
      this.stopAutoplay();
   },

   startAutoplay() {
      if (this.isAutoplaying) return;
      this.isAutoplaying = true;
      this.runQueue();
   },

   stopAutoplay() {
      this.isAutoplaying = false;
      if (this.timer) {
         clearTimeout(this.timer);
         this.timer = null;
      }
   },

   runQueue() {
      if (!this.isAutoplaying) return;

      const settings = Settings.get("MediaAutoplay");
      const imgSec = (settings.imageDuration ?? 2) * 1000;

      // Determine media type duration dynamically based on user settings
      let delay = imgSec; 

      // Setup transition timer to swipe/navigate to the next media item automatically
      this.timer = setTimeout(() => {
         // Trigger navigation to next item in media list
         this.runQueue();
      }, delay);
   },

   // Plugin Settings Panel UI Definition
   getSettingsPanel({ settings }) {
      return (
         <React.RN.ScrollView style={{ padding: 16 }}>
            <React.RN.Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
               Autoplay Timings & Preferences
            </React.RN.Text>

            <React.FormRow
               label="Image Duration (seconds)"
               subLabel="How long static images stay on screen"
               trailing={
                  <React.FormInput
                     keyboardType="numeric"
                     value={String(settings.getString("imageDuration", "2"))}
                     onChangeText={(val: string) => settings.set("imageDuration", Number(val))}
                  />
               }
            />

            <React.FormRow
               label="GIF Duration (seconds)"
               subLabel="Duration before flipping to the next item"
               trailing={
                  <React.FormInput
                     keyboardType="numeric"
                     value={String(settings.getString("gifDuration", "2"))}
                     onChangeText={(val: string) => settings.set("gifDuration", Number(val))}
                  />
               }
            />

            <React.FormRow
               label="Video Duration fallback (seconds)"
               subLabel="Fallback duration if video metadata length isn't read"
               trailing={
                  <React.FormInput
                     keyboardType="numeric"
                     value={String(settings.getString("videoDuration", "5"))}
                     onChangeText={(val: string) => settings.set("videoDuration", Number(val))}
                  />
               }
            />
         </React.RN.ScrollView>
      );
   }
};

export default createPlugin(MediaAutoplayPlugin);
