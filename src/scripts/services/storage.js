// src/scripts/services/storage.js
// Estado em memoria e exportacao manual para JSON.

const NOME_ARQUIVO_EXPORTACAO = "especies_madeira.json";
let especiesEmMemoria = [];
let arquivoEspeciesHandle = null;

async function carregarEspeciesIniciais() {
	try {
		if (window.location.protocol === "file:") {
			return;
		}

		const resposta = await fetch(`./${NOME_ARQUIVO_EXPORTACAO}`, {
			cache: "no-store",
		});

		if (!resposta.ok) {
			return;
		}

		const dados = await resposta.json();
		if (Array.isArray(dados) && especiesEmMemoria.length === 0) {
			especiesEmMemoria = [...dados];
		}
	} catch (erro) {
		// Mantem o app funcional mesmo sem arquivo local.
	}
}

function lerArquivoComoTexto(arquivo) {
	return new Promise((resolve, reject) => {
		const leitor = new FileReader();
		leitor.onload = () => resolve(String(leitor.result || ""));
		leitor.onerror = () => reject(leitor.error || new Error("Falha ao ler arquivo."));
		leitor.readAsText(arquivo, "utf-8");
	});
}

async function garantirPermissaoEscrita(handle) {
	if (!handle || typeof handle.queryPermission !== "function") {
		return false;
	}

	let permissao = await handle.queryPermission({ mode: "readwrite" });
	if (permissao === "granted") {
		return true;
	}

	if (typeof handle.requestPermission !== "function") {
		return false;
	}

	permissao = await handle.requestPermission({ mode: "readwrite" });
	return permissao === "granted";
}

function getEspecies() {
	return [...especiesEmMemoria];
}

function saveEspecies(lista) {
	especiesEmMemoria = Array.isArray(lista) ? [...lista] : [];
}

function addEspecie(especie) {
	especiesEmMemoria.push(especie);
}

function updateEspecie(index, especie) {
	if (index < 0 || index >= especiesEmMemoria.length) {
		return;
	}
	especiesEmMemoria[index] = especie;
}

function removeEspecie(index) {
	if (index < 0 || index >= especiesEmMemoria.length) {
		return;
	}
	especiesEmMemoria.splice(index, 1);
}

async function importarEspecies() {
	let arquivo = null;

	if (typeof window.showOpenFilePicker === "function") {
		try {
			const [fileHandle] = await window.showOpenFilePicker({
				id: "woodex-especies-open",
				multiple: false,
				types: [
					{
						description: "Arquivo JSON",
						accept: {
							"application/json": [".json"],
						},
					},
				],
			});

			if (!fileHandle) {
				return false;
			}

			arquivoEspeciesHandle = fileHandle;
			arquivo = await fileHandle.getFile();
		} catch (erro) {
			if (erro && erro.name === "AbortError") {
				return false;
			}
		}
	}

	if (!arquivo) {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json,application/json";
		input.style.display = "none";

		arquivo = await new Promise((resolve) => {
			input.addEventListener("change", () => {
				resolve(input.files && input.files[0] ? input.files[0] : null);
			});
			document.body.appendChild(input);
			input.click();
			document.body.removeChild(input);
		});
		arquivoEspeciesHandle = null;
	}

	if (!arquivo) {
		return false;
	}

	try {
		const texto = await lerArquivoComoTexto(arquivo);
		if (!texto.trim()) {
			console.warn("Arquivo JSON vazio.");
			return false;
		}

		const dados = JSON.parse(texto);
		if (!Array.isArray(dados)) {
			console.warn("JSON invalido: esperado um array.");
			return false;
		}

		especiesEmMemoria = [...dados];
		return true;
	} catch (erro) {
		console.warn("Falha ao importar JSON.", erro);
		return false;
	}
}

async function exportarEspecies() {
	const conteudo = JSON.stringify(especiesEmMemoria, null, 2);

	if (arquivoEspeciesHandle) {
		try {
			const podeEscrever = await garantirPermissaoEscrita(arquivoEspeciesHandle);
			if (podeEscrever) {
				const writableDireto = await arquivoEspeciesHandle.createWritable();
				await writableDireto.write(conteudo);
				await writableDireto.close();
				return;
			}
		} catch (erro) {
			console.warn("Falha ao salvar no arquivo carregado.", erro);
		}
	}

	if (typeof window.showSaveFilePicker === "function") {
		try {
			const fileHandle = await window.showSaveFilePicker({
				suggestedName: NOME_ARQUIVO_EXPORTACAO,
				types: [
					{
						description: "Arquivo JSON",
						accept: {
							"application/json": [".json"],
						},
					},
				],
			});

			const writable = await fileHandle.createWritable();
			await writable.write(conteudo);
			await writable.close();
			arquivoEspeciesHandle = fileHandle;
			return;
		} catch (erro) {
			if (erro && erro.name === "AbortError") {
				return;
			}
			console.warn("Falha ao salvar pelo seletor.", erro);
		}
	}

	const blob = new Blob([conteudo], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");

	link.href = url;
	link.download = NOME_ARQUIVO_EXPORTACAO;
	link.style.display = "none";

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
}

window.getEspecies = getEspecies;
window.saveEspecies = saveEspecies;
window.addEspecie = addEspecie;
window.updateEspecie = updateEspecie;
window.removeEspecie = removeEspecie;
window.exportarEspecies = exportarEspecies;
window.importarEspecies = importarEspecies;

carregarEspeciesIniciais();
