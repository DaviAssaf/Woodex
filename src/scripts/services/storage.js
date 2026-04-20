const NOME_ARQUIVO_EXPORTACAO = "especies_madeira.json";

let especiesEmMemoria = [];
let arquivoEspeciesHandle = null;

const DB_NAME = "woodex-db";
const STORE_NAME = "arquivos";

function abrirDB() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, 1);

		req.onupgradeneeded = () => {
			req.result.createObjectStore(STORE_NAME);
		};

		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

async function salvarHandle(handle) {
	const db = await abrirDB();
	const tx = db.transaction(STORE_NAME, "readwrite");

	tx.objectStore(STORE_NAME).put(handle, "arquivo");

	return tx.complete;
}

async function carregarHandleSalvo() {
	const db = await abrirDB();
	const tx = db.transaction(STORE_NAME, "readonly");

	return new Promise((resolve) => {
		const req = tx.objectStore(STORE_NAME).get("arquivo");

		req.onsuccess = () => resolve(req.result || null);
		req.onerror = () => resolve(null);
	});
}

async function carregarEspeciesIniciais() {
	try {
		arquivoEspeciesHandle = await carregarHandleSalvo();

		if (!arquivoEspeciesHandle) return false;

		const permissao = await arquivoEspeciesHandle.queryPermission({
			mode: "readwrite",
		});

		if (permissao !== "granted") return false;

		const file = await arquivoEspeciesHandle.getFile();

		const texto = await file.text();

		const dados = JSON.parse(texto);

		if (Array.isArray(dados)) {
			especiesEmMemoria = dados;
		}

		return true;
	} catch (erro) {
		console.warn("Erro ao carregar arquivo salvo", erro);
		return false;
	}
}

function getEspecies() {
	return [...especiesEmMemoria];
}

async function autoSalvar() {
	if (!arquivoEspeciesHandle) return;

	try {
		await exportarEspecies();
	} catch (erro) {
		console.warn("Falha no auto-salvamento", erro);
	}
}

function addEspecie(especie) {
	especiesEmMemoria.push(especie);
	autoSalvar();
}

function updateEspecie(index, especie) {
	if (index < 0 || index >= especiesEmMemoria.length) return;

	especiesEmMemoria[index] = especie;

	autoSalvar();
}

function removeEspecie(index) {
	if (index < 0 || index >= especiesEmMemoria.length) return;

	especiesEmMemoria.splice(index, 1);

	autoSalvar();
}

async function garantirPermissaoEscrita(handle) {
	if (!handle) return false;

	let permissao = await handle.queryPermission({ mode: "readwrite" });

	if (permissao === "granted") return true;

	permissao = await handle.requestPermission({ mode: "readwrite" });

	return permissao === "granted";
}

async function importarEspecies() {
	if (typeof window.showOpenFilePicker !== "function") {
		alert("Seu navegador não suporta abrir arquivos.");
		return false;
	}

	try {
		const [fileHandle] = await window.showOpenFilePicker({
			types: [
				{
					description: "JSON",
					accept: { "application/json": [".json"] },
				},
			],
		});

		arquivoEspeciesHandle = fileHandle;

		await salvarHandle(fileHandle);

		const arquivo = await fileHandle.getFile();

		const texto = await arquivo.text();

		const dados = JSON.parse(texto);

		if (!Array.isArray(dados)) return false;

		especiesEmMemoria = dados;

		return true;
	} catch (erro) {
		if (erro.name !== "AbortError") {
			console.warn("Erro ao importar JSON", erro);
		}
		return false;
	}
}

async function exportarEspecies() {
	if (!arquivoEspeciesHandle) return;

	const podeEscrever = await garantirPermissaoEscrita(arquivoEspeciesHandle);

	if (!podeEscrever) return;

	const conteudo = JSON.stringify(especiesEmMemoria, null, 2);

	const writable = await arquivoEspeciesHandle.createWritable();

	await writable.write(conteudo);

	await writable.close();
}

window.getEspecies = getEspecies;
window.addEspecie = addEspecie;
window.updateEspecie = updateEspecie;
window.removeEspecie = removeEspecie;
window.importarEspecies = importarEspecies;
window.exportarEspecies = exportarEspecies;

(async () => {
	const carregou = await carregarEspeciesIniciais();

	if (carregou) {
		if (window.renderTabelas) window.renderTabelas();
	}
})();