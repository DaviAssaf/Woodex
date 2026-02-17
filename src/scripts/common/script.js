// src/scripts/common/script.js

document.addEventListener("DOMContentLoaded", () => {
	const dialog = document.getElementById("registroDialog");
	const form = document.getElementById("registroForm");
	const novoRegistroBtn = document.getElementById("novoRegistroBtn");
	const salvarBtn = document.getElementById("salvarBtn");
	const cancelarBtn = document.getElementById("cancelarBtn");
	let editIndex = null;

	function renderTabelas() {
		const especies = window.getEspecies();
		const categoriaIdMap = {
			CITES: "cites-table",
			"Não-CITES": "nao-cites-table",
			Ameaçadas: "ameacadas-table",
		};
		Object.entries(categoriaIdMap).forEach(([cat, id]) => {
			const container = document.getElementById(id);
			if (!container) return;
			const filtradas = especies
				.filter((e) => e.categoria === cat)
				.sort((a, b) => a.nomePopular.localeCompare(b.nomePopular, "pt-BR"));
			container.innerHTML = gerarTabela(filtradas, cat);
		});
		adicionarEventosAcoes();
	}

	function gerarTabela(lista, categoria) {
		if (!lista.length) return "<p>Nenhum registro.</p>";
		let html = "<table><thead><tr><th>Nome Popular</th><th>Nome Científico</th><th>Ações</th></tr></thead><tbody>";
		lista.forEach((especie, idx) => {
			html += `<tr data-categoria="${categoria}" data-nome="${especie.nomePopular}">
				<td>${especie.nomePopular}</td>
				<td>${especie.nomeCientifico}</td>
				<td>
					<button class="editarBtn" data-index="${window.getEspecies().findIndex((e) => e.nomePopular === especie.nomePopular && e.categoria === categoria)}">Editar</button>
					<button class="removerBtn" data-index="${window.getEspecies().findIndex((e) => e.nomePopular === especie.nomePopular && e.categoria === categoria)}">Remover</button>
				</td>
			</tr>`;
		});
		html += "</tbody></table>";
		return html;
	}

	function adicionarEventosAcoes() {
		document.querySelectorAll(".editarBtn").forEach((btn) => {
			btn.onclick = (e) => {
				const idx = Number(btn.dataset.index);
				const especies = window.getEspecies();
				const especie = especies[idx];
				editIndex = idx;
				form.nomePopular.value = especie.nomePopular;
				form.nomeCientifico.value = especie.nomeCientifico;
				form.categoria.value = especie.categoria;
				document.getElementById("dialogTitle").textContent = "Editar Registro";
				dialog.showModal();
			};
		});
		document.querySelectorAll(".removerBtn").forEach((btn) => {
			btn.onclick = (e) => {
				const idx = Number(btn.dataset.index);
				if (window.confirm("Deseja remover este registro?")) {
					window.removeEspecie(idx);
					renderTabelas();
				}
			};
		});
	}

	novoRegistroBtn.onclick = () => {
		editIndex = null;
		form.reset();
		document.getElementById("dialogTitle").textContent = "Novo Registro";
		dialog.showModal();
	};

	cancelarBtn.onclick = () => {
		dialog.close();
	};

	form.onsubmit = (e) => {
		e.preventDefault();
		const especie = {
			nomePopular: form.nomePopular.value.trim(),
			nomeCientifico: form.nomeCientifico.value.trim(),
			categoria: form.categoria.value,
		};
		if (editIndex !== null) {
			window.updateEspecie(editIndex, especie);
		} else {
			window.addEspecie(especie);
		}
		dialog.close();
		renderTabelas();
	};

	renderTabelas();
});
