module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: "Shacli",
        linux: {
          description:
            "Shacli help you share data between your mobile device and your computer through the clipboard and file drag and drop",
          category: "Utility",
          icon: "./build/icons"
        },
        files: ["**/*"],
        extraResources: [
          {
            from: "./public/client",
            to: "client",
            filter: ["**/*"]
          },
          {
            from: "./public/icon.png",
            to: "icon.png",
            filter: ["**/*"]
          }
          // "./public/client/**",
          // "./public/**"
        ]
        // extraFiles: [
        //   {
        //     from: "./public/icon.png",
        //     to: "icon.png",
        //     filter: ["**/*"]
        //   }
        // ]
      }
    }
  }
};
