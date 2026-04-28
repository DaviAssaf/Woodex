<?php

class EspecieModel
{
    private $conn;

    public function __construct()
    {
        $this->conn = require __DIR__ . '/../config/config.php';
    }

    public function getAll(): array
    {
        $sql = '
            SELECT
                id,
                popular_name AS nomePopular,
                cientific_name AS nomeCientifico,
                category AS categoria
            FROM woods
            ORDER BY popular_name ASC
        ';

        $result = $this->conn->query($sql);

        $especies = [];

        while ($row = $result->fetch_assoc()) {
            $row['id'] = (int) $row['id'];
            $especies[] = $row;
        }

        return $especies;
    }

    public function checkConnection(): array
    {
        $result = $this->conn->query('SELECT 1 AS online');
        $row = $result->fetch_assoc();

        return [
            'database' => 'connected',
            'online' => isset($row['online']) && (int) $row['online'] === 1,
        ];
    }

    public function add(array $especie): array
    {
        $dados = $this->sanitizeEspecie($especie);

        $sql = '
            INSERT INTO woods (popular_name, cientific_name, category)
            VALUES (?, ?, ?)
        ';
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param(
            'sss',
            $dados['nomePopular'],
            $dados['nomeCientifico'],
            $dados['categoria']
        );
        $stmt->execute();
        $stmt->close();

        $dados['id'] = $this->conn->insert_id;

        return $dados;
    }

    public function update(int $id, array $especie): array
    {
        if ($id <= 0) {
            throw new InvalidArgumentException('ID invalido para atualizacao.');
        }

        $dados = $this->sanitizeEspecie($especie);

        $sql = '
            UPDATE woods
            SET popular_name = ?, cientific_name = ?, category = ?
            WHERE id = ?
        ';
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param(
            'sssi',
            $dados['nomePopular'],
            $dados['nomeCientifico'],
            $dados['categoria'],
            $id
        );
        $stmt->execute();
        $affectedRows = $stmt->affected_rows;
        $stmt->close();

        if ($affectedRows === 0 && !$this->exists($id)) {
            throw new RuntimeException('Registro nao encontrado para atualizacao.');
        }

        $dados['id'] = $id;

        return $dados;
    }

    public function delete(int $id): void
    {
        if ($id <= 0) {
            throw new InvalidArgumentException('ID invalido para remocao.');
        }

        $sql = 'DELETE FROM woods WHERE id = ?';
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $affectedRows = $stmt->affected_rows;
        $stmt->close();

        if ($affectedRows === 0) {
            throw new RuntimeException('Registro nao encontrado para remocao.');
        }
    }

    private function sanitizeEspecie(array $especie): array
    {
        $nomePopular = trim((string) ($especie['nomePopular'] ?? ''));
        $nomeCientifico = trim((string) ($especie['nomeCientifico'] ?? ''));
        $categoria = trim((string) ($especie['categoria'] ?? ''));

        if ($nomePopular === '' || $nomeCientifico === '' || $categoria === '') {
            throw new InvalidArgumentException('Campos obrigatorios da especie nao foram informados.');
        }

        return [
            'nomePopular' => $nomePopular,
            'nomeCientifico' => $nomeCientifico,
            'categoria' => $categoria,
        ];
    }

    private function exists(int $id): bool
    {
        $sql = 'SELECT id FROM woods WHERE id = ? LIMIT 1';
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $stmt->store_result();
        $exists = $stmt->num_rows > 0;
        $stmt->close();

        return $exists;
    }
}
