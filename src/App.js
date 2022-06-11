import './App.css';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import axios from 'axios';

var orange = "#F18F01";
var blue = "#006E90";
// var desaturated_blue = "#ADCAD6";
var odd_green = "#99C24D";
// var bright_blue = "#41BBD9";

var pickStart = true;
var pickEnd = true;
var barriers = [];
var start_pos = null;
var end_pos = null;
var path = null;

var selectedColor = "#000000"

function Pixel(props) {
	const { row, col } = props;

	const [pixelColor, setPixelColor] = useState("#fff");
	const [oldColor, setOldColor] = useState(pixelColor);
	const [canChangeColor, setCanChangeColor] = useState(true);

	function applyColor() {
		setPixelColor(selectedColor);
		setCanChangeColor(false);
	}

	function controlledApplyColor() {
		if (selectedColor === orange && pickStart === true) {
			applyColor();
			start_pos = [row, col];
			pickStart = false;
		} else if (selectedColor === blue && pickEnd === true) {
			applyColor();
			end_pos = [row, col];
			pickEnd = false;
		} else if (selectedColor !== orange && selectedColor !== blue) {
			if (oldColor === orange) {
				applyColor();
				start_pos = null;
				pickStart = true;
			}
			if (oldColor === blue) {
				applyColor();
				end_pos = null;
				pickEnd = true;
			}
			if (selectedColor === "#000000") {
				barriers.push([row, col]);
			}
			if (selectedColor === "#ffffff") {
				if (barriers.indexOf([row, col]) !== -1) {
					barriers.splice(barriers.indexOf([row, col]), 1);
				}
			}
			applyColor();
		}
	}

	function changeColorOnHover() {
		setOldColor(pixelColor);
		setPixelColor(selectedColor);
	}

	function resetColor() {
		if (canChangeColor) {
			setPixelColor(oldColor);
		}

		setCanChangeColor(true);
	}

	return (
		<div
			className="pixel"
			onClick={controlledApplyColor}
			onMouseEnter={changeColorOnHover}
			onMouseLeave={resetColor}
			style={{ backgroundColor: pixelColor }}
		></div>
	);
}

function Row(props) {
	const { Dx, row } = props;
	let pixcels = [];
	for (let i = 0; i < Dx; i++) {
		pixcels.push(<Pixel col={i} row={row} />)
	}
	return (
		<div className="row">{pixcels}</div>
	);
}

function Pannel(props) {
	const { Dx, Dy, } = props;
	let rows = [];
	for (let i = 0; i < Dy; i++) {
		rows.push(<Row row={i} Dx={Dx} />)
	}
	return (
		<div className="maze">{rows}</div>
	);
}

function isArrayInArray(arr, item) {
	var item_as_string = JSON.stringify(item);

	var contains = arr.some(function (ele) {
		return JSON.stringify(ele) === item_as_string;
	});
	return contains;
}

function AnswerPixel(props) {
	const { row, col } = props;


	while (path === null) {
		continue;
	}
	var pixelColor = "#fff"
	var point = [row, col];
	if (JSON.stringify(point) == JSON.stringify(start_pos)) {
		pixelColor = orange;
	} else if (JSON.stringify(point) == JSON.stringify(end_pos)) {
		pixelColor = blue;
	} else if (barriers !== [] && isArrayInArray(barriers, point)) {
		pixelColor = "#000";
	} else if (isArrayInArray(path, point)) {
		pixelColor = odd_green;
	}

	return (
		<div
			className="pixel"
			style={{ backgroundColor: pixelColor }}
		></div>
	);
}

function AnswerRow(props) {
	const { Dx, row } = props;
	let pixcels = [];
	for (let i = 0; i < Dx; i++) {
		pixcels.push(<AnswerPixel col={i} row={row} />)
	}
	return (
		<div className="row">{pixcels}</div>
	);
}

function AnswerPannel(props) {
	const { Dx, Dy, } = props;
	let rows = [];
	for (let i = 0; i < Dy; i++) {
		rows.push(<AnswerRow row={i} Dx={Dx} />)
	}
	return (
		<div className="maze">{rows}</div>
	);
}

function ShowAnswer(props) {
	const { Dx, Dy } = props;
	while (path === null) {
		continue;
	}
	return <AnswerPannel Dx={Dx} Dy={Dy} />;
}

function App() {

	const [Dx, set_x] = useState(3);
	const [Dy, set_y] = useState(3);
	const [hideDrawingPanel, setHideDrawingPanel] = useState(true);
	const [hideAnswerPanel, setHideAnswerPanel] = useState(false);
	const [noAnswer, setNoAnswer] = useState(false);

	const Update_x = (event) => {
		if (event.target.value > 50) {
			set_x(50);
		} else {
			set_x(event.target.value);
		}
	};
	const Update_y = (event) => {
		if (event.target.value > 50) {
			set_y(50);
		} else {
			set_y(event.target.value);
		}
	};

	async function request(start_pos, end_pos, Dx, Dy, barriers) {
		if (start_pos !== null && end_pos !== null) {
			try {
				var response = null;
				if (JSON.stringify(barriers) == JSON.stringify([])) {
					response = await axios.request("http://localhost:8000/" + String(start_pos) + "/" + String(end_pos) + "/" + Dx + "/" + Dy + "/0");
					barriers = [];
				} else {
					response = await axios.request("http://localhost:8000/" + String(start_pos) + "/" + String(end_pos) + "/" + Dx + "/" + Dy + "/" + String(barriers));
					if (response.data === "none"){
						throw "no_path"
					}
				}
				path = response.data;
				setHideDrawingPanel(false);
				setHideAnswerPanel(true);
			} catch (error) {
				setHideDrawingPanel(false);
				setNoAnswer(true);
			}
		}
	}

	return (
		<div className="App">
			<div className="content">
				<h1>
					Maze Solver
				</h1>
				{hideDrawingPanel && (
					<div className="drawingPanel">
						<div className="input">
							<div>
								<h2>Rows</h2>
							</div>
							<div className='test_field'>
								<TextField
									type='number'
									id="outlined-name"
									label="Rows"
									value={Dx}
									onChange={Update_x}
								/>
							</div>
							<div>
								<h2>Columns</h2>
							</div>
							<div className='test_field'>
								<TextField
									type='number'
									id="outlined-name"
									label="Columns"
									value={Dy}
									onChange={Update_y}
								/>
							</div>
						</div>
						<div className="color_picker">
							<div>
								<h4>Start</h4>
							</div>
							<div
								className="pixel_picker"
								style={{ backgroundColor: orange }}
								onClick={() => {
									selectedColor = orange;
								}}
							></div>
							<div>
								<h4>End</h4>
							</div>
							<div
								className="pixel_picker"
								style={{ backgroundColor: blue }}
								onClick={() => {
									selectedColor = blue;
								}}
							></div>
							<div>
								<h4>Barrier</h4>
							</div>
							<div
								className="pixel_picker"
								style={{ backgroundColor: "#000000" }}
								onClick={() => {
									selectedColor = "#000000";
								}}
							></div>
							<div>
								<h4>Clear</h4>
							</div>
							<div
								className="pixel_picker"
								style={{ backgroundColor: "#ffffff" }}
								onClick={() => {
									selectedColor = "#ffffff";
								}}
							></div>
						</div>
						<Pannel Dx={Dx} Dy={Dy} />
						<div className="submit_button">
							<Button
								variant="contained"
								disableElevation
								onClick={() => {
									request(start_pos, end_pos, Dx, Dy, barriers);
								}}
							>Solve !</Button>
						</div>
					</div>)}
				{hideAnswerPanel && (
					<div className="answer">
						<div className="color_picker">
							<div>
								<h4>Start</h4>
							</div>
							<div
								className="pixel_picker"
								style={{ backgroundColor: orange }}
							></div>
							<div>
								<h4>End</h4>
							</div>
							<div
								className="pixel_picker"
								style={{ backgroundColor: blue }}
							></div>
							<div>
								<h4>Barrier</h4>
							</div>
							<div
								className="pixel_picker"
								style={{ backgroundColor: "#000000" }}
							></div>
							<div>
								<h4>Path</h4>
							</div>
							<div
								className="pixel_picker"
								style={{ backgroundColor: odd_green }}
							></div>
						</div>
						<ShowAnswer Dx={Dx} Dy={Dy} />
						<div className="submit_button">
							<Button
								variant="contained"
								disableElevation
								onClick={() => {
									start_pos = null;
									pickStart = true;
									end_pos = null;
									pickEnd = true;
									barriers = [];
									setHideDrawingPanel(true);
									setHideAnswerPanel(false);
								}}
							>Draw Maze</Button>
						</div>
					</div>)}
				{noAnswer && (
					<div className="no_answer">
						<div>
							<h4>
								There is no path
							</h4>
						</div>
						<div className="submit_button">
							<Button
								variant="contained"
								disableElevation
								onClick={() => {
									start_pos = null;
									pickStart = true;
									end_pos = null;
									pickEnd = true;
									setHideDrawingPanel(true);
									setNoAnswer(false);
								}}
							>Draw Maze</Button>
						</div>
					</div>)}
			</div>
		</div>
	);
}

export default App;
