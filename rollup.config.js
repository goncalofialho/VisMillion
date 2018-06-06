import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

export default{
    entry: './js/modules/main.js',
    targets: [
        {
            dest: './js/bundle.js',
            format: 'es',
            moduleName: 'VisMillionBundle'
        }
    ],
    plugins:[
        serve({
            open: true,
            contentBase: './',
            port: 8888,
        }),
        livereload()
    ]
}