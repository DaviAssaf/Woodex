document.addEventListener("DOMContentLoaded", () => {
	const dialog = document.getElementById("registroDialog");
	const form = document.getElementById("registroForm");
	const novoRegistroBtn = document.getElementById("novoRegistroBtn");

	let editId = null;

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
		(async () => {
			const especies = await window.getEspecies();

			Object.entries(categoriaIdMap).forEach(([categoria, id]) => {
				const container = document.getElementById(id);

				let filtradas = especies.filter((e) => e.categoria === categoria);

				if (filtro) {
					const termo = filtro.toLowerCase();

					filtradas = filtradas.filter((e) => e.nomePopular.toLowerCase().includes(termo) || e.nomeCientifico.toLowerCase().includes(termo));
				}

				filtradas.sort((a, b) => a.nomePopular.localeCompare(b.nomePopular, "pt-BR"));

				container.innerHTML = gerarTabela(filtradas, especies);
			});

			adicionarEventosAcoes();
		})();
	}

	function gerarTabela(lista, especies) {
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

		lista.forEach((especie) => {
			html += `
			<tr>
			<td>${especie.nomePopular}</td>
			<td>${especie.nomeCientifico}</td>
			<td>
			<button class="editarBtn" data-id="${especie.id}">Editar</button>
			<button class="removerBtn" data-id="${especie.id}">Remover</button>
			</td>
			</tr>`;
		});

		html += "</tbody></table>";

		return html;
	}

	function adicionarEventosAcoes() {
		document.querySelectorAll(".editarBtn").forEach((btn) => {
			btn.onclick = () => {
				const id = Number(btn.dataset.id);

				(async () => {
					const especies = await window.getEspecies();
					const especie = especies.find((e) => e.id === id);

					editId = id;

					form.nomePopular.value = especie.nomePopular;
					form.nomeCientifico.value = especie.nomeCientifico;
					form.categoria.value = especie.categoria;

					dialog.showModal();
				})();
			};
		});

		document.querySelectorAll(".removerBtn").forEach((btn) => {
			btn.onclick = async () => {
				const id = Number(btn.dataset.id);

				if (confirm("Remover registro?")) {
					await window.removeEspecie(id);

					renderTabelas();
				}
			};
		});
	}

	novoRegistroBtn.onclick = () => {
		editId = null;

		form.reset();

		dialog.showModal();
	};

	form.onsubmit = async (e) => {
		e.preventDefault();

		const especie = {
			nomePopular: form.nomePopular.value.trim(),
			nomeCientifico: form.nomeCientifico.value.trim(),
			categoria: form.categoria.value,
		};

		if (editId !== null) {
			await window.updateEspecie(editId, especie);
		} else {
			await window.addEspecie(especie);
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
