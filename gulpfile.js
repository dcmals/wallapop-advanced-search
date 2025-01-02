const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser'); // Minificación de JS
const path = require('path');

// Rutas de los archivos
const paths = {
    styles: {
        src: './scss/**/*.scss',         // SCSS de entrada
        dest: './css'                    // CSS de salida
    },
    scripts: {
        src: './main.js',                // Archivo JS original
        dest: './'                       // Carpeta donde se guardará el archivo minificado
    },
    html: './index.html',                // Archivo HTML original
    output: path.resolve('../obfuscated') // Carpeta final para copiar los resultados
};

// Tarea para compilar SCSS, minificar y escribir sobre `styles.min.css`
function compileAndMinifySCSS() {
    return gulp.src(paths.styles.src)
        .pipe(sourcemaps.init())             // Inicia el mapeo de fuentes
        .pipe(sass().on('error', sass.logError)) // Compila SCSS a CSS
        .pipe(cleanCSS({ compatibility: 'ie11' })) // Minifica el CSS
        .pipe(rename({ basename: 'styles', suffix: '.min' })) // Renombra a `styles.min.css`
        .pipe(sourcemaps.write('./'))        // Escribe el archivo de mapeo
        .pipe(gulp.dest(paths.styles.dest)); // Guarda el archivo final
}

// Tarea para minificar el JS
function minifyJS() {
    return gulp.src(paths.scripts.src)
        .pipe(sourcemaps.init())             // Inicia el mapeo de fuentes
        .pipe(terser())                      // Minifica el JS
        .pipe(rename({ basename: 'main', suffix: '.min' })) // Renombra a `main.min.js`
        .pipe(sourcemaps.write('./'))        // Escribe el archivo de mapeo
        .pipe(gulp.dest(paths.scripts.dest)); // Guarda el archivo final
}

// Tarea para copiar archivos a la carpeta `obfuscated`
function copyToObfuscated() {
    return gulp.src([
        paths.html,                            // index.html
        './css/styles.min.css',               // CSS minificado
        './main.min.js'                       // JS minificado
    ])
        .pipe(gulp.dest(paths.output));           // Copia a `obfuscated`
}

// Tarea para observar cambios en SCSS, JS y HTML
function watchFiles() {
    gulp.watch(paths.styles.src, gulp.series(compileAndMinifySCSS, copyToObfuscated));
    gulp.watch(paths.scripts.src, gulp.series(minifyJS, copyToObfuscated));
    gulp.watch(paths.html, copyToObfuscated);
}

// Tarea predeterminada que compila y copia los archivos
exports.default = gulp.series(
    gulp.parallel(compileAndMinifySCSS, minifyJS),
    copyToObfuscated
);

// Tarea para observar cambios
exports.watch = watchFiles;
