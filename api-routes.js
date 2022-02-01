// Dependencies
let router = require('express').Router();

const { exec } = require("child_process");

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

// Export API routes 
module.exports = router;