document.addEventListener("DOMContentLoaded", () => {
	const dialog = document.getElementById("registroDialog");
	const form = document.getElementById("registroForm");
	const novoRegistroBtn = document.getElementById("novoRegistroBtn");
	const cancelarBtn = document.getElementById("cancelarBtn");
	const logoutBtn = document.getElementById("logoutBtn");
	const sessionUser = document.getElementById("sessionUser");

	let editId = null;

	const categoriaIdMap = {
		CITES: "cites-table",
		"Não-CITES": "nao-cites-table",
		Ameaçadas: "ameacadas-table",
	};

	function criarInterfaceExtra() {
		const barra = document.createElement("div");

		const busca = document.createElement("input");
		busca.placeholder = "Buscar espécie...";

		const contador = document.createElement("div");

		barra.appendChild(busca);
		barra.appendChild(contador);

		novoRegistroBtn.after(barra);

		busca.oninput = () => {
			renderTabelas(busca.value);
		};
	}

	function exibirErroNasTabelas(mensagem) {
		Object.values(categoriaIdMap).forEach((id) => {
			const container = document.getElementById(id);
			container.innerHTML = `<p>Nao foi possivel carregar os registros: ${mensagem}</p>`;
		});
	}

	function redirecionarParaLogin() {
		window.location.href = "/Woodex/index.html";
	}

	function tratarErroAutenticacao(error) {
		if (error?.statusCode === 401) {
			redirecionarParaLogin();
			return true;
		}

		return false;
	}

	function renderTabelas(filtro = "") {
		(async () => {
			try {
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
			} catch (error) {
				if (tratarErroAutenticacao(error)) {
					return;
				}

				exibirErroNasTabelas("verifique a conexao com o servidor.");
			}
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
					try {
						const especies = await window.getEspecies();
						const especie = especies.find((e) => e.id === id);

						if (!especie) {
							throw new Error("Registro nao encontrado para edicao.");
						}

						editId = id;

						form.nomePopular.value = especie.nomePopular;
						form.nomeCientifico.value = especie.nomeCientifico;
						form.categoria.value = especie.categoria;

						dialog.showModal();
					} catch (error) {
						if (tratarErroAutenticacao(error)) {
							return;
						}

						alert("Nao foi possivel carregar o registro.");
					}
				})();
			};
		});

		document.querySelectorAll(".removerBtn").forEach((btn) => {
			btn.onclick = async () => {
				const id = Number(btn.dataset.id);

				if (confirm("Remover registro?")) {
					try {
						await window.removeEspecie(id);
						renderTabelas();
					} catch (error) {
						if (tratarErroAutenticacao(error)) {
							return;
						}

						alert("Nao foi possivel remover o registro.");
					}
				}
			};
		});
	}

	novoRegistroBtn.onclick = () => {
		editId = null;

		form.reset();

		dialog.showModal();
	};

	cancelarBtn.onclick = () => {
		editId = null;
		form.reset();
		dialog.close();
	};

	if (logoutBtn) {
		logoutBtn.onclick = async () => {
			try {
				await window.logout();
			} finally {
				redirecionarParaLogin();
			}
		};
	}

	form.onsubmit = async (e) => {
		e.preventDefault();

		const especie = {
			nomePopular: form.nomePopular.value.trim(),
			nomeCientifico: form.nomeCientifico.value.trim(),
			categoria: form.categoria.value,
		};

		try {
			if (editId !== null) {
				await window.updateEspecie(editId, especie);
			} else {
				await window.addEspecie(especie);
			}

			dialog.close();
			renderTabelas();
		} catch (error) {
			if (tratarErroAutenticacao(error)) {
				return;
			}

			alert("Nao foi possivel salvar o registro.");
		}
	};

	(async () => {
		try {
			const session = await window.getSession();

			if (!session || !session.authenticated) {
				redirecionarParaLogin();
				return;
			}

			if (sessionUser && session.user?.username) {
				sessionUser.textContent = `Usuario: ${session.user.username}`;
			}

			criarInterfaceExtra();
			renderTabelas();

			setTimeout(() => {
				renderTabelas();
			}, 200);
		} catch (error) {
			redirecionarParaLogin();
		}
	})();
});
