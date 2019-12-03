const $q = $("#zustand");
const $c = $("#comment");
const $qF = $("#von-zustand");
const $qT = $("#zu-zustand");
const $eF = $("#von-zeichen");
const $eT = $("#zu-zeichen");

var running = false;
var speed = 2;
var lastCell = 0;
var editingInstructionIndex = 0;
var currentInstructionIndex = 0;
var instructions = [];
instructions[0] = {
	comment: "beispiel",
	qFrom: "q0",
	qTo: "q1",
	eFrom: "0",
	eTo: "0",
	dir: 1
}
instructions[1] = {
	comment: "beispiel2",
	qFrom: "q1",
	qTo: "q0",
	eFrom: "1",
	eTo: "1",
	dir: -1
}

updateInstruction(0);
updateInstruction(1);

$c.on("input", function() {
	instructions[editingInstructionIndex].comment = $c.val();
	updateInstruction();});
$qF.on("input", function() {
	instructions[editingInstructionIndex].qFrom = $qF.val();
	updateInstruction();});
$qT.on("input", function() {
	instructions[editingInstructionIndex].qTo = $qT.val();
	updateInstruction();});
$eF.on("input", function() {
	instructions[editingInstructionIndex].eFrom = $eF.val();
	updateInstruction();});
$eT.on("input", function() {
	instructions[editingInstructionIndex].eTo = $eT.val();
	updateInstruction();});
$("input[type=radio][name=radioDirection]").change(function() {
	instructions[editingInstructionIndex].dir = $(this).index() / 2 - 1;
	updateInstruction();
});

$("#bandtext").on("input", function() {
	$("#cell-container .cell").empty();
	let text = $(this).val();
	for(let i = 0; i < text.length; i++) {
		cell(i, text[i]);
	}
});

function i(x) {
	if(x != null) {
		$("#cell-container").css("right", x + "em");
		return x;
	} else {
		return $("#cell-container").css("right").replace(/[^-\d\.]/g, '')/$("#cell-container").css("font-size").replace(/[^-\d\.]/g, '');
	}
}

function q(x) {
	if(x != null)
		$q.text(x);
	return $q.text().trim();
}

function cell(ind, x) {
	if(x != null)
		$("#cell-container .cell").eq(ind ? ind : i()).text(x);
	return $("#cell-container .cell").eq(ind ? ind : i()).text();
}

function initCells() {
	$("#cell-container").empty();
	/*
	let i = 0;
	do {
		$("#band").append(createCell(i));
		i++;
	} while(i * $("#band .cell:first-child").outerWidth() < $("#visualizer").width());
	*/
	$("#cell-container").append( $("<div contenteditable></div>").addClass("cell").text(0));
	$("#cell-container").append( $("<div contenteditable></div>").addClass("cell").text(1));
	for(let i = 0; i < 100; i++) {
		$("#cell-container").append( $("<div contenteditable></div>").addClass("cell"));
	}
}

function initInstruction() {

}

function instructionClick() {
	$("#program-container").children().eq(editingInstructionIndex).removeClass("viewing");
	$(this).addClass("viewing");
	editingInstructionIndex = $(this).index();
	let instruction = instructions[editingInstructionIndex];
	$c.val(instruction.comment);
	$qF.val(instruction.qFrom);
	$qT.val(instruction.qTo);
	$eF.val(instruction.eFrom);
	$eT.val(instruction.eTo);
	$("#direction input").eq(instruction.dir + 1).prop("checked", true);
}

function updateInstruction(ind) {
	if(!ind)
		ind = editingInstructionIndex;
	let instruction = instructions[ind];
	$("#program-container .instruction").eq(ind).text(`${instruction.qFrom}: ${instruction.eFrom} 🠒 ${instruction.qTo}: ${instruction.eTo} ${['◄', '■', '►'][instruction.dir + 1]}`);
}

initCells();
$("#program-container").on("click", "> .instruction", instructionClick);
$("#new-instruction").on("click", function() {
	instructions.push({
		comment: "",
		qFrom: q(),
		qTo: "",
		eFrom: cell(),
		eTo: "",
		dir: 1
	});
	$("#program-container .instruction:last").after($("<div></div>").text("new Instruction").addClass("instruction"));
	updateInstruction(instructions.length - 1);
});
$("#speed-slider").on("input", function() {
	speed = $(this).val();
	$("#speed").text(speed + " IPS");
	$("#cell-container").css("transition-duration", (1 / speed) + 's');
});
$("#pause").on("click", function() {
	running = !running;
	$(this).toggleClass("fa-pause fa-play");
	if(running)
		step();
});
$("#step").on("click", step);

$("#cell-container").on("change", "> .cell", function() {
	let ind = $(this).index();
	let bandtext = $("#bandtext").val();
	if(bandtext.length < ind)
		bandtext += ' '.repeat(ind - bandtext.length);
	bandtext[ind] = $(this).text();
	$("#bandtext").val(bandtext);
});

function step() {
	if(!running)
		return;
	let cq = q();
	let ce = cell(i());
	$("#program-container").children().eq(currentInstructionIndex).removeClass("current");
	currentInstructionIndex = instructions.findIndex(e => e.qFrom == cq && e.eFrom == ce);
	if(currentInstructionIndex == -1) {
		running = false;
		console.log("No fitting instruction");
		return;
	}
	let ci = instructions[currentInstructionIndex];
	$("#program-container").children().eq(currentInstructionIndex).addClass("current");
	cell(i(), ci.eTo);
	q(ci.qTo);
	if(ci.dir == 0)
		return running = false;
	$("#cell-container").one("transitionend", step);
	i(i() + ci.dir);
}

$(".instruction:first").trigger("click");

if(running)
	step();