// Copyright 2017, Venkat Peri.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

const assert = require( 'assert' );
const gulp = require( 'gulp' );
const tasks = require( '..' )( gulp );
const path = require( 'path' );
const memoryStreams = require( 'memory-streams' );
const uniqueString = require( 'unique-string' );

const testStr = 'this is a test';

describe( 'spawnTask', () => {

  let output = null;
  let input = null;
  beforeEach( () => {
    input = new memoryStreams.ReadableStream();
    output = new memoryStreams.WritableStream();
  } );

  describe( 'redirects', () => {

    it( 'stdio', ( done ) => {
      tasks.spawnTask( 'cat:file', {
        cmd: 'cat',
        args: [path.resolve( __dirname, 'fixtures/test.txt' )],
        stdout: output
      } );
      gulp.task( 'cat:file:verify', ['cat:file'], () =>
        assert.equal( output.toString().trim(), testStr )
      );
      gulp.start( 'cat:file:verify', done );
    } );

    it( 'stdin', ( done ) => {
      tasks.spawnTask( 'cat:stdin', {
        cmd: 'cat',
        stdin: input,
        stdout: output
      } );
      input.append( testStr );
      gulp.task( 'cat:stdin:verify', ['cat:stdin'], () =>
        assert.equal( output.toString().trim(), testStr )
      );
      gulp.start( 'cat:stdin:verify', done );
    } );

    it( 'stderr', ( done ) => {
      const badFile = path.resolve( __dirname, 'fixtures/badfile.txt' );

      tasks.spawnTask( 'cat:badfile', {
        cmd: 'cat',
        args: [badFile],
        stderr: output
      } );
      gulp.task( 'cat:badfile:verify', ['cat:badfile'], () =>
        done( new Error( 'should not get here' ) )
      );
      gulp.start( 'cat:badfile:verify', ( err ) => {
        assert( err instanceof Error );
        assert.equal(output.toString().trim(), `cat: ${badFile}: No such file or directory`)
        done();
      } );
    } );
  } );

  it( 'fails on bad command', ( done ) => {
    tasks.spawnTask( 'badCmd', {
      cmd: uniqueString(),
    } );
    gulp.start( 'badCmd', ( err ) => {
      assert( err instanceof Error );
      done();
    } );
  } );

} );
