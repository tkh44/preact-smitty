import buble from 'rollup-plugin-buble'

export default {
  useStrict: false,
  plugins: [buble()],
  globals: {
    preact: 'preact',
    smitty: 'smitty'
  }
}
