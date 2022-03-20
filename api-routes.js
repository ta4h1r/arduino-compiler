// Dependencies
let router = require('express').Router();

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const fs = require('fs')  				    // readFile function is defined


// Default API response 
router.get('/', (req, res) => {
	console.log('\n\nTest GET hit');
	res.json({
		status: 200,
		message: 'Welcome to my world'
	});
});



// TODO: Try/catch and throw at strategic points to return errors to client
router.route('/compile')
	.post(async (req, res) => {
		console.log("REQ", req.body);

		const code = req.body?.data?.code;

		if (code) {

			const sketchName = "tmp" + "_" + Date.now();
			const board = "uno";

			// Create a new Arduino sketch 
			console.log("\nCreating new Arduino sketch")
			let termOut = await exec(
				`arduino-cli sketch new ${sketchName}`
			);


			console.log('stdout:', termOut.stdout);
			console.error('stderr:', termOut.stderr);

			// Write data to sketch file
			console.log("Writing code to sketch file")
			if (!termOut.stderr) {
				termOut = await exec(
					`echo "${code}" > ${sketchName}/${sketchName}.ino`
				);
			}

			console.log('stdout:', termOut.stdout);
			console.error('stderr:', termOut.stderr);

			if (!termOut.stderr) {
				// Compile sketch
				console.log("Compiling sketch")
				try {
					termOut = await exec(
						`arduino-cli compile -b arduino:avr:${board} -e /usr/src/app/${sketchName}`
					);
				} catch (err) {
					console.log("ERR:", err); 
					err[`${sketchName}`] = code
					res.status(500).json({
						error: err,
					})
					return; 
				}
			}


			console.log('stdout:', termOut.stdout);
			console.error('stderr:', termOut.stderr);

			const compilerMessage = termOut.stdout;

			// Read compiled code
			console.log("Reading HEX")
			let hexFileContents = await getText(`/usr/src/app/${sketchName}/build/arduino.avr.${board}/${sketchName}.ino.hex`);

			console.log('stdout:', termOut.stdout);
			console.error('stderr:', termOut.stderr);


			// Delete sketch contents 
			console.log("Deleting temporary sketch file")
			termOut = await exec(
				`rm -rf ${sketchName}`
			);

			console.log('stdout:', termOut.stdout);
			console.error('stderr:', termOut.stderr);

			if (hexFileContents) {
				console.log("DONE");

				res.status(200).json({
					sketch: sketchName,
					message: compilerMessage,
					hex: hexFileContents,
				});

			} else {
				console.log("FAILED 500")
				res.status(500).json({
					message: "Something went wrong",
					compilerMessage: compilerMessage
				})
			}

		} else {
			console.log("FAILED 400")
			res.status(400).json({
				error: "Cannot compile empty sketch."
			})
		}

	});

function getText(path) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, 'utf-8', async (err, data) => {
			if (err) throw err;
			resolve(data);
		});
	})
}

// Export API routes 
module.exports = router;