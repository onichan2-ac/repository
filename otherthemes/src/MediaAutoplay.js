const { Plugin, plastique, React, setelah, Navigation } = window.enmity.lib;
const { createPlugin } = window.enmity.managers.plugins;
const { Settings } = window.enmity.metro.common;
const { findByProps } = window.enmity.metro;

// Define settings keys and default values
const DEFAULT_SETTINGS = {
   videoDuration: 1,      // plays once (or generic placeholder seconds)
   gifDuration: 2,        // plays twice approx
   imageDuration: 2,      // 2 seconds default
   loopMedia: false,      // option to loop the media stream
};

const MediaAutoplayPlugin = {
   name: "MediaAutoplay",
   settings: Settings.use(DEFAULT_SETTINGS),

   onStart() {
      this.isAutoplaying = false;
      this.currentIndex = 0;

      // 1. Patch the ActionSheet (the three-dot menu in media view)
      try {
         const ActionSheetModule = findByProps("openLazy", "hideActionSheet");
         
         setelah(ActionSheetModule, "openLazy", (args, res) => {
            res?.then((sheet) => {
               // Inject custom row/button into the component tree safely when media viewer sheet opens
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

      let delay = imgSec; 

      this.timer = setTimeout(() => {
         // Trigger navigation to next item in media list
         this.runQueue();
      }, delay);
   },

   // Plugin Settings Panel UI Definition using vanilla React.createElement
   getSettingsPanel({ settings }) {
      return React.createElement(
         React.RN.ScrollView,
         { style: { padding: 16 } },
         React.createElement(
            React.RN.Text,
            { style: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 } },
            "Autoplay Timings & Preferences"
         ),
         React.createElement(React.FormRow, {
            label: "Image Duration (seconds)",
            subLabel: "How long static images stay on screen",
            trailing: React.createElement(React.FormInput, {
               keyboardType: "numeric",
               value: String(settings.getString("imageDuration", "2")),
               onChangeText: (val) => settings.set("imageDuration", Number(val))
            })
         }),
         React.createElement(React.FormRow, {
            label: "GIF Duration (seconds)",
            subLabel: "Duration before flipping to the next item",
            trailing: React.createElement(React.FormInput, {
               keyboardType: "numeric",
               value: String(settings.getString("gifDuration", "2")),
               onChangeText: (val) => settings.set("gifDuration", Number(val))
            })
         }),
         React.createElement(React.FormRow, {
            label: "Video Duration fallback (seconds)",
            subLabel: "Fallback duration if video metadata length isn't read",
            trailing: React.createElement(React.FormInput, {
               keyboardType: "numeric",
               value: String(settings.getString("videoDuration", "5")),
               onChangeText: (val) => settings.set("videoDuration", Number(val))
            })
         })
      );
   }
};

export default createPlugin(MediaAutoplayPlugin);
