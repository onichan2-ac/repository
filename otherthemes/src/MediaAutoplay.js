function registerPlugin(pluginObject) {
   window.enmity.plugins.registerPlugin(pluginObject);
}

function findModuleProps(...props) {
   return window.enmity.modules.getByProps(...props);
}

const Toasts = window.enmity.modules.common.Toasts;
const React = window.enmity.modules.common.React;
const Settings = window.enmity.modules.common.Settings;

const DEFAULT_SETTINGS = {
   videoDuration: "1",
   gifDuration: "2",
   imageDuration: "2",
};

const pluginName = "MediaAutoplayV5";
const pluginVersion = "1.2.0";
const pluginBuild = "patch-1.2.0";
const pluginDescription = "Auto-play through Discord channel media sections.";
const pluginAuthors = [{ name: "Onichan", id: "0" }];
const pluginColor = "#ff0069";
const pluginSourceUrl = "https://raw.githubusercontent.com/onichan2-ac/repository/refs/heads/main/otherthemes/src/index.js";

const manifest = {
   name: pluginName,
   version: pluginVersion,
   build: pluginBuild,
   description: pluginDescription,
   authors: pluginAuthors,
   color: pluginColor,
   sourceUrl: pluginSourceUrl
};

const patcher = window.enmity.patcher.create(pluginName);
const actionSheetModule = findModuleProps("openLazy", "hideActionSheet");

const MediaAutoplayPlugin = {
   ...manifest,

   onStart() {
      this.isAutoplaying = false;
      this.timer = null;

      try {
         if (actionSheetModule && actionSheetModule.openLazy) {
            patcher.before(actionSheetModule, "openLazy", (thisArg, [sheetName, renderFunc]) => {
               console.log(`[${pluginName}] ActionSheet triggered:`, sheetName);
            });
         }
      } catch (error) {
         console.error(`[${pluginName}] Error during patch initialization:`, error);
      }
   },

   onStop() {
      patcher.unpatchAll();
      this.stopAutoplay();
   },

   startAutoplay() {
      if (this.isAutoplaying) return;
      this.isAutoplaying = true;
      Toasts.open({ content: "Media Autoplay Started!", source: window.enmity.assets.getIDByName("Check") });
      this.runQueue();
   },

   stopAutoplay() {
      if (!this.isAutoplaying) return;
      this.isAutoplaying = false;
      if (this.timer) {
         clearTimeout(this.timer);
         this.timer = null;
      }
      Toasts.open({ content: "Media Autoplay Stopped", source: window.enmity.assets.getIDByName("Check") });
   },

   runQueue() {
      if (!this.isAutoplaying) return;

      const imgSec = Number(Settings.get(pluginName, "imageDuration", DEFAULT_SETTINGS.imageDuration)) * 1000;

      this.timer = setTimeout(() => {
         this.runQueue();
      }, imgSec);
   },

   getSettingsPanel({ settings }) {
      return React.createElement(
         window.enmity.components.ScrollView,
         { style: { padding: 16 } },
         React.createElement(
            window.enmity.components.Text,
            { style: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 12 } },
            "Autoplay Timings & Preferences"
         ),
         React.createElement(window.enmity.components.FormRow, {
            label: "Image Duration (seconds)",
            subLabel: "How long static images stay on screen",
            trailing: React.createElement(window.enmity.components.FormInput, {
               keyboardType: "numeric",
               value: settings.getString("imageDuration", DEFAULT_SETTINGS.imageDuration),
               onChangeText: (val) => settings.set("imageDuration", val)
            })
         }),
         React.createElement(window.enmity.components.FormRow, {
            label: "GIF Duration (seconds)",
            subLabel: "Duration before flipping to the next item",
            trailing: React.createElement(window.enmity.components.FormInput, {
               keyboardType: "numeric",
               value: settings.getString("gifDuration", DEFAULT_SETTINGS.gifDuration),
               onChangeText: (val) => settings.set("gifDuration", val)
            })
         }),
         React.createElement(window.enmity.components.FormRow, {
            label: "Video Duration fallback (seconds)",
            subLabel: "Fallback duration if video metadata length isn't read",
            trailing: React.createElement(window.enmity.components.FormInput, {
               keyboardType: "numeric",
               value: settings.getString("videoDuration", DEFAULT_SETTINGS.videoDuration),
               onChangeText: (val) => settings.set("videoDuration", val)
            })
         })
      );
   }
};

registerPlugin(MediaAutoplayPlugin);
