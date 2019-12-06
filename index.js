const $q = $("#zustand");
const $c = $("#comment");
const $qF = $("#von-zustand");
const $qT = $("#zu-zustand");
const $eF = $("#von-zeichen");
const $eT = $("#zu-zeichen");

var running = false;
var speed = 2;
var index = 0;
var editingInstructionIndex = 0;
var currentInstructionIndex = 0;
var instructions = [];

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
$("#program-text").on("input", function() {
	let splits = $("#program-text").val().split('\n');
	for(let i = 0; i < splits.length; i++) {
		if(!instructions[i])
			instructions[i] = {};
		let ins = instructions[i];
		let splits2 = splits[i].split(';');
		if(splits2.length >= 4) {
			ins.comment = splits2[3];
			ins.qFrom = splits2[0].split(':')[0];
			ins.eFrom = splits2[0].split(':')[1];
			ins.qTo = splits2[1].split(':')[0];
			ins.eTo = splits2[1].split(':')[1];
			ins.dir = parseInt(splits2[2]);
		}
		if(i >= $("#program-container .instruction").length) {
			$("#new-instruction").before($("<div></div>").addClass("instruction"));
		}
		$("#program-container .instruction").eq(i).text(`${ins.qFrom || ''}: ${ins.eFrom || ''} 🠒 ${ins.qTo || ''}: ${ins.eTo || ''} ${['◄', '■', '►'][ins.dir + 1] || ''}`);
	}
	if(instructions.length > splits.length) {
		instructions = instructions.slice(0, splits.length);
		$("#program-container .instruction").slice(splits.length).remove();
		editingInstructionIndex = Math.min(editingInstructionIndex, instructions.length -1);
	}
	let ins = instructions[editingInstructionIndex];
	$qF.val(ins.qFrom);
	$eF.val(ins.eFrom);
	$qT.val(ins.qTo);
	$eT.val(ins.eTo);
	$c.val(ins.comment);
	$("#direction input").eq(ins.dir + 1).prop("checked", true);
});

String.prototype.replaceAt = function(index, replacement) {
	return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

function i(x) {
	if(x != null) {
		index = x;
		$("#cell-container").css("right", index + "em");
	}
	return index;
	//return $("#cell-container").css("right").replace(/[^-\d\.]/g, '')/$("#cell-container").css("font-size").replace(/[^-\d\.]/g, '');
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
	for(let i = 0; i < 100; i++) {
		$("#cell-container").append( $("<div contenteditable></div>").addClass("cell"));
	}
}

function initInstruction() {

}

function updateBand(x) {
	if(x == null)
		x = i();
	let text =  $("#bandtext").val();
	if (x > text.length)
		text = text + ' '.repeat(x - text.length);
	$("#bandtext").val(text.replaceAt(x, cell(x) || ' '));
}

function instructionClick() {
	$("#program-container").children().removeClass("viewing");
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
	if(ind == null)
		ind = editingInstructionIndex;
	let ins = instructions[ind];
	$("#program-container .instruction").eq(ind).text(`${ins.qFrom}: ${ins.eFrom} 🠒 ${ins.qTo}: ${ins.eTo} ${['◄', '■', '►'][ins.dir + 1]}`);
	let text = $("#program-text").val().split('\n');
	text[ind] = `${ins.qFrom || ''}:${ins.eFrom || ''};${ins.qTo || ''}:${ins.eTo || ''};${ins.dir || ''};${ins.comment || ''}`;
	$("#program-text").val(text.join('\n'));
}

function pause(bool) {
	if(!(bool === false || bool === true))
		bool = !running;
	running = bool;
	if(running) {
		$("#pause").addClass("fa-pause");
		$("#pause").removeClass("fa-play");
	} else {
		$("#pause").addClass("fa-play");
		$("#pause").removeClass("fa-pause");
	}
	if(running)
		step();
}

initCells();
$("#program-container").on("click", "> .instruction", instructionClick);
$("#new-instruction").on("click", function() {
	instructions.push({
		comment: "",
		qFrom: q(),
		qTo: q(),
		eFrom: cell(),
		eTo: cell(),
		dir: 1
	});
	$("#new-instruction").before($("<div></div>").text("").addClass("instruction"));
	editingInstructionIndex = instructions.length - 1;
	$(".instruction:last").trigger("click");
	updateInstruction(instructions.length - 1);
});
$("#speed-slider").on("input", function() {
	speed = $(this).val();
	$("#speed").text(speed + " IPS");
	$("#cell-container").css("transition-duration", (1 / speed) + 's');
});
$("#pause").on("click", pause);
$("#step").on("click", step);
$("#left").on("click", function() { i(i() - 1); });
$("#right").on("click", function() { i(i() + 1); });

$("#cell-container").on("input", "> .cell", function(event) {
	$(this).text(event.originalEvent.data);
	updateBand($(this).index());
});

function step() {
	if(!running && $(this).attr("id") != "step")
		return;
	let cq = q();
	let ce = cell(i());
	$("#program-container").children().eq(currentInstructionIndex).removeClass("current");
	currentInstructionIndex = instructions.findIndex(e => e.qFrom == cq && e.eFrom == ce);
	if(currentInstructionIndex == -1) {
		pause(false);
		console.log("No fitting instruction");
		$("#active-cell-marker").addClass("red");
		return;
	}
	$("#active-cell-marker").removeClass("red");
	let ci = instructions[currentInstructionIndex];
	$("#program-container").children().eq(currentInstructionIndex).addClass("current");
	cell(i(), ci.eTo);
	q(ci.qTo);
	updateBand();
	if(ci.dir == 0) {
		pause(false);
		$("#active-cell-marker").addClass("red");
		return;
	}
	$("#cell-container").one("transitionend", step);
	i(i() + ci.dir);
}

$(".instruction:first").trigger("click");

step();

/* Binary Counter

q0:;q1:;-1;
q0:0;q0:0;1;
q0:1;q0:1;1;
q1:;q2:1;1;
q1:0;q2:1;-1;
q1:1;q1:0;-1;
q2:;q0:;-1;
q2:0;q2:0;1;
q2:1;q2:1;1;
*/