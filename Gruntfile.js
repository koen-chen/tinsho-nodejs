module.exports = function(grunt){
	grunt.initConfig({
        nodemon: {
            prod:{
                options: {
                    ignoredFiles: ['client/*', 'node_modules/*', 'server/views/*']
                }
            }
        }
	});

    grunt.loadNpmTasks('grunt-nodemon');

    grunt.registerTask('default', ['nodemon']);
};