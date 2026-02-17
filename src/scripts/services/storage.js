// src/scripts/services/storage.js
// Persistência de espécies de madeira no localStorage

const STORAGE_KEY = "especies_madeira";

function getEspecies() {
	const data = localStorage.getItem(STORAGE_KEY);
	return data ? JSON.parse(data) : [];
}

function saveEspecies(lista) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

function addEspecie(especie) {
	const especies = getEspecies();
	especies.push(especie);
	saveEspecies(especies);
}

function updateEspecie(index, especie) {
	const especies = getEspecies();
	especies[index] = especie;
	saveEspecies(especies);
}

function removeEspecie(index) {
	const especies = getEspecies();
	especies.splice(index, 1);
	saveEspecies(especies);
}

// Torna as funções globais para uso em outros scripts
window.getEspecies = getEspecies;
window.saveEspecies = saveEspecies;
window.addEspecie = addEspecie;
window.updateEspecie = updateEspecie;
window.removeEspecie = removeEspecie;
