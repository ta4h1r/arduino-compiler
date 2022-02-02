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


router.route('/ls')
	.post((req, res) => {
		exec("ls -la", (error, stdout, stderr) => {
		if (error) {
			console.log(`error: ${error.message}`);
			res.status(500).json({
				message: "error"
			})
			return;
		}
		if (stderr) {
			console.log(`stderr: ${stderr}`);
			res.status(500).json({
				message: "stderror"
			})
			return;
		}
		console.log(`stdout: ${stdout}`);
		res.status(200).json({
				stdout: `${stdout}`
			})
	});
});
	

router.route('/compile')
	.post(async (req, res) => {
		console.log("REQ", req.body);
		
		const code = req.body?.data?.code; 
		
		if(code) {
			
			const sketchName = "tmp" + "_" + Date.now(); 
			const board="uno";
			
			// Create a new Arduino sketch 
			let termOut  = await exec(
				`arduino-cli sketch new ${sketchName}`
			);
			
			
			console.log('stdout:', termOut.stdout);
			console.error('stderr:', termOut.stderr);
						
			// Write data to sketch file
			if(!termOut.stderr) {
				termOut = await exec(
					`echo "${code}" > ${sketchName}/${sketchName}.ino`
				);
			}

			console.log('stdout:', termOut.stdout);
			console.error('stderr:', termOut.stderr);
			
			if(!termOut.stderr) {
				// Compile sketch
				termOut = await exec(
					`arduino-cli compile -b arduino:avr:${board} -e /usr/src/app/${sketchName}`
				);
			}
		

			console.log('stdout:', termOut.stdout);
			console.error('stderr:', termOut.stderr);
			
			// Read compiled code
			let hexFileContents;
			hexFileContents = await getText(`/usr/src/app/${sketchName}/build/arduino.avr.${board}/${sketchName}.ino.hex`);
			

			console.log('stdout:', termOut.stdout);
			console.error('stderr:', termOut.stderr);
			
			
			// Delete sketch contents 
			termOut = await exec(
				`rm -rf ${sketchName}`
			);

			console.log('stdout:', termOut.stdout);
			console.error('stderr:', termOut.stderr);
	
			console.log("HEX:", hexFileContents)
			if(hexFileContents) {
				
				res.status(200).json({
					message: "Compiled sketch " + sketchName, 
					data: hexFileContents, 
				});
				
			} else {
				res.status(500).json({
					message: "Something went wrong"
				})
			}
			
		} else {
			res.status(400).json({
				message: "Bad request body"
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