import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        allprofiles: resolve(__dirname, "html/allprofiles.html"),
        createlisting: resolve(__dirname, "html/create-listing.html"),
        login: resolve(__dirname, "html/login.html"),
        register: resolve(__dirname, "html/register.html"),
        profile: resolve(__dirname, "html/profile.html"),
        editprofile: resolve(__dirname, "html/edit-profile.html"),
        singlelisting: resolve(__dirname, "html/single-listing.html"),
        differentprofile: resolve(__dirname, "html/different-profile.html"),
      },
    },
  },
});
