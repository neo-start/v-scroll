import { defineConfig } from "vite"
import { readFileSync, mkdirSync, writeFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { minify } from "csso"

const __dirname = dirname(fileURLToPath(import.meta.url))

const CSS_SRC = "src/v-scroll.css", CSS_OUT = "themes/default/v-scroll.js"

const generateCss = () => {
  const css = minify(readFileSync(resolve(CSS_SRC), "utf8")).css
  mkdirSync(dirname(resolve(CSS_OUT)), { recursive: true })
  writeFileSync(resolve(CSS_OUT), `export default \`${css}\`;\n`)
}

const cssToEsm = () => ({
  name: "css-to-esm",
  configResolved() { generateCss() },
  handleHotUpdate({ file, server }) {
    if (file.endsWith("v-scroll.css")) {
      generateCss()
      server.ws.send({ type: "full-reload" })
    }
  }
})

export default defineConfig({
  plugins: [cssToEsm()],
  resolve: {
    alias: { "$": resolve(__dirname, "themes/default") }
  }
})
