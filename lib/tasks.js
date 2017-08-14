const spawn = require( 'cross-spawn-promise' );
const pify = require( 'pify' );
const rimraf = pify( require( 'rimraf' ) );
const GLogStream = require( './GLogStream' );

module.exports = ( gulp ) => {

  /**
   * Creates a gulp task which when started spawns the supplied
   * command with arguments.
   *
   * By default, the command output is logged via gutil.log()
   *
   * @param {String} name - the task name
   * @param {string[]} [deps] - gulp task dependencies
   * @param {Object} opts - options
   * @param {String} opts.cmd - The command to run
   * @param {String[]} [opts.cmd] - List of string arguments
   * @param {Object} [opts.opts] - spawn options {@link https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options }
   * @param {Boolean} [opts.noLog] - Don't log command output
   * @param {String} [opts.tag] - tag to use with log strings
   * @param {Readable} [opts.stdin] - pipe this stream into the process' stdin
   * @param {Writable} [opts.stdout] - pipe process' stdout to this stream
   * @param {Writable} [opts.stderr] - pipe process' stderr to this stream
   * @returns {undefined} none
   */
  function spawnTask( name, deps, opts ) {
    [opts, deps] = opts ? [opts, deps] : [deps, null];

    return gulp.task( name, deps, () => {
      const proc = spawn( opts.cmd, opts.args, opts.opts );

      if ( opts.stdin ) {
        opts.stdin.pipe( proc.childProcess.stdin );
      }

      if ( opts.stderr ) {
        proc.childProcess.stderr.pipe( opts.stdout );
      }

      if ( opts.stdout ) {
        proc.childProcess.stdout.pipe( opts.stdout );
      }
      else if ( !opts.noLog ) {
        const tag = opts.tag || name;
        proc.childProcess.stdout.pipe( new GLogStream( { tag: tag } ) );
      }

      return proc;
    } )
  }

  /**
   * Creates a gulp task which when started, recursively removes
   * files and directories with the given glob
   *
   * @param {String} name - the task name
   * @param {string[]} [deps] - gulp task dependencies
   * @param {Object} opts - options
   * @param {string} opts.dir - the dir(s) to remove
   */
  const rmdirTask = ( name, deps, opts ) => {
    [opts, deps] = opts ? [opts, deps] : [deps, null];
    gulp.task( name, deps, () => rimraf( opts.dir ) )
  };

  /**
   * Creates a gulp task which when started, wait for the
   * supplied milliseconds before completing.
   *
   * @param {String} name - the task name
   * @param {string[]} [deps] - gulp task dependencies
   * @param {Object} opts - options
   * @param {Number} opts.duration - the time to wait in milliseconds
   */
  const delayTask = ( name, deps, opts ) => {
    [opts, deps] = opts ? [opts, deps] : [deps, null];
    return gulp.task( name, deps, ( done ) => {
      setTimeout( done, opts.duration )
    } )
  };

  return {
    spawnTask,
    rmdirTask,
    delayTask
  }
};


