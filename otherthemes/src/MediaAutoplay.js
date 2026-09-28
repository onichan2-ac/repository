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
   videoDuration: 1,
   gifDuration: 2,
   imageDuration: 2,
   loopMedia: false,
};

const pluginName = "MediaAutoplayV3";
const pluginVersion = "1.0.0";
const pluginBuild = "patch-1.0.0";
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
      console.log(`[${pluginName}] Started successfully!`);
      
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
      console.log(`[${pluginName}] Stopped and unpatched.`);
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
               value: String(settings.getString("imageDuration", "2")),
               onChangeText: (val) => settings.set("imageDuration", Number(val))
            })
         }),
         React.createElement(window.enmity.components.FormRow, {
            label: "GIF Duration (seconds)",
            subLabel: "Duration before flipping to the next item",
            trailing: React.createElement(window.enmity.components.FormInput, {
               keyboardType: "numeric",
               value: String(settings.getString("gifDuration", "2")),
               onChangeText: (val) => settings.set("gifDuration", Number(val))
            })
         }),
         React.createElement(window.enmity.components.FormRow, {
            label: "Video Duration fallback (seconds)",
            subLabel: "Fallback duration if video metadata length isn't read",
            trailing: React.createElement(window.enmity.components.FormInput, {
               keyboardType: "numeric",
               value: String(settings.getString("videoDuration", "5")),
               onChangeText: (val) => settings.set("videoDuration", Number(val))
            })
         })
      );
   }
};

registerPlugin(MediaAutoplayPlugin);
