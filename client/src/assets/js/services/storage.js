async function getEspecies() {
	const response = await fetch("../../src/api.php");
	return await response.json();
}

async function addEspecie(especie) {
	await fetch("../../src/api.php", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			action: "add",
			especie: JSON.stringify(especie),
		}),
	});
}

async function updateEspecie(id, especie) {
	await fetch("../../src/api.php", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			action: "update",
			id: id,
			especie: JSON.stringify(especie),
		}),
	});
}

async function removeEspecie(id) {
	await fetch("../../src/api.php", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			action: "delete",
			id: id,
		}),
	});
}

// For importarEspecies, we can keep it simple or remove for now
async function importarEspecies() {
	// For now, alert that it's not implemented
	alert("Importar não implementado no servidor.");
	return false;
}

async function exportarEspecies() {
	// Download the JSON
	const especies = await getEspecies();
	const blob = new Blob([JSON.stringify(especies, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "especies_madeira.json";
	a.click();
	URL.revokeObjectURL(url);
}

window.getEspecies = getEspecies;
window.addEspecie = addEspecie;
window.updateEspecie = updateEspecie;
window.removeEspecie = removeEspecie;
window.importarEspecies = importarEspecies;
window.exportarEspecies = exportarEspecies;
