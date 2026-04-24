<?php
require_once __DIR__ . '/../config/config.php';

class EspecieModel {
    private $conn;

    public function __construct() {
        $this->conn = require __DIR__ . '/../config/config.php';
    }

    public function getAll() {
        $sql = "SELECT * FROM especies_madeira";
        $result = $this->conn->query($sql);
        $especies = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $especies[] = $row;
            }
        }
        return $especies;
    }

    public function add($especie) {
        $sql = "INSERT INTO especies_madeira (nome_popular, nome_cientifico, categoria) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sss", $especie['nomePopular'], $especie['nomeCientifico'], $especie['categoria']);
        $stmt->execute();
        $stmt->close();
    }

    public function update($id, $especie) {
        $sql = "UPDATE especies_madeira SET nome_popular=?, nome_cientifico=?, categoria=? WHERE id=?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sssi", $especie['nomePopular'], $especie['nomeCientifico'], $especie['categoria'], $id);
        $stmt->execute();
        $stmt->close();
    }

    public function delete($id) {
        $sql = "DELETE FROM especies_madeira WHERE id=?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->close();
    }
}
?>