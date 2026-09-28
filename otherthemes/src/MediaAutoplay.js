/**
 * @name MediaAutoplay
 * @author Onichan
 * @description Auto-play through Discord channel media sections.
 * @version 1.0.2
*/

const { Plugin, React, setelah } = window.enmity.lib;
const { createPlugin } = window.enmity.managers.plugins;
const { Settings } = window.enmity.metro.common;
const { findByProps } = window.enmity.metro;

const DEFAULT_SETTINGS = {
   videoDuration: 1,
   gifDuration: 2,
   imageDuration: 2,
   loopMedia: false,
};

const MediaAutoplay = {
   name: "MediaAutoplay",
   version: "1.0.2",
   description: "Auto-play through Discord channel media sections.",
   authors: [{ name: "Onichan", id: "0" }],
   settings: Settings.use(DEFAULT_SETTINGS),

   onStart() {
      this.isAutoplaying = false;
      this.currentIndex = 0;

      try {
         const ActionSheetModule = findByProps("openLazy", "hideActionSheet");
         
         if (ActionSheetModule && ActionSheetModule.openLazy) {
            setelah(ActionSheetModule, "openLazy", (args, res) => {
               console.log("[MediaAutoplay] ActionSheet opened with args:", args);
               
               res?.then((sheet) => {
                  console.log("[MediaAutoplay] Resolved ActionSheet component:", sheet);
               });
            });
         }
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

      this.timer = setTimeout(() => {
         this.runQueue();
      }, imgSec);
   },

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

module.exports = createPlugin(MediaAutoplay);
