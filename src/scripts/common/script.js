document.addEventListener("DOMContentLoaded", () => {
	const dialog = document.getElementById("registroDialog");
	const form = document.getElementById("registroForm");
	const novoRegistroBtn = document.getElementById("novoRegistroBtn");

	let editIndex = null;

	const categoriaIdMap = {
		CITES: "cites-table",
		"Não-CITES": "nao-cites-table",
		Ameaçadas: "ameacadas-table",
	};

	function criarInterfaceExtra() {
		const barra = document.createElement("div");

		const carregarBtn = document.createElement("button");
		carregarBtn.textContent = "Carregar JSON";

		const busca = document.createElement("input");
		busca.placeholder = "Buscar espécie...";

		const contador = document.createElement("div");

		barra.appendChild(carregarBtn);
		barra.appendChild(busca);
		barra.appendChild(contador);

		novoRegistroBtn.after(barra);

		carregarBtn.onclick = async () => {
	const carregou = await window.importarEspecies();

	if (carregou) renderTabelas();
};

		busca.oninput = () => {
			renderTabelas(busca.value);
		};
	}

	function renderTabelas(filtro = "") {
		const especies = window.getEspecies();

		Object.entries(categoriaIdMap).forEach(([categoria, id]) => {
			const container = document.getElementById(id);

			let filtradas = especies.filter((e) => e.categoria === categoria);

			if (filtro) {
				const termo = filtro.toLowerCase();

				filtradas = filtradas.filter(
					(e) =>
						e.nomePopular.toLowerCase().includes(termo) ||
						e.nomeCientifico.toLowerCase().includes(termo)
				);
			}

			filtradas.sort((a, b) =>
				a.nomePopular.localeCompare(b.nomePopular, "pt-BR")
			);

			container.innerHTML = gerarTabela(filtradas);
		});

		adicionarEventosAcoes();
	}

	function gerarTabela(lista) {
		if (!lista.length) return "<p>Nenhum registro.</p>";

		let html = `
		<table>
		<thead>
		<tr>
		<th>Nome Popular</th>
		<th>Nome Científico</th>
		<th>Ações</th>
		</tr>
		</thead>
		<tbody>`;

		const especies = window.getEspecies();

		lista.forEach((especie) => {
			const index = especies.indexOf(especie);

			html += `
			<tr>
			<td>${especie.nomePopular}</td>
			<td>${especie.nomeCientifico}</td>
			<td>
			<button class="editarBtn" data-index="${index}">Editar</button>
			<button class="removerBtn" data-index="${index}">Remover</button>
			</td>
			</tr>`;
		});

		html += "</tbody></table>";

		return html;
	}

	function adicionarEventosAcoes() {
		document.querySelectorAll(".editarBtn").forEach((btn) => {
			btn.onclick = () => {
				const idx = Number(btn.dataset.index);

				const especie = window.getEspecies()[idx];

				editIndex = idx;

				form.nomePopular.value = especie.nomePopular;
				form.nomeCientifico.value = especie.nomeCientifico;
				form.categoria.value = especie.categoria;

				dialog.showModal();
			};
		});

		document.querySelectorAll(".removerBtn").forEach((btn) => {
			btn.onclick = () => {
				const idx = Number(btn.dataset.index);

				if (confirm("Remover registro?")) {
					window.removeEspecie(idx);

					renderTabelas();
				}
			};
		});
	}

	novoRegistroBtn.onclick = () => {
		editIndex = null;

		form.reset();

		dialog.showModal();
	};

	form.onsubmit = (e) => {
		e.preventDefault();

		const especie = {
			nomePopular: form.nomePopular.value.trim(),
			nomeCientifico: form.nomeCientifico.value.trim(),
			categoria: form.categoria.value,
		};

		if (!window.getEspecies) return;

		if (editIndex !== null) {
			window.updateEspecie(editIndex, especie);
		} else {
			window.addEspecie(especie);
		}

		dialog.close();

		renderTabelas();
	};

	criarInterfaceExtra();

renderTabelas();

setTimeout(() => {
	renderTabelas();
}, 200);
});