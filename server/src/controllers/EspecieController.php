<?php
require_once __DIR__ . '/../models/EspecieModel.php';

class EspecieController {
    private $model;

    public function __construct() {
        $this->model = new EspecieModel();
    }

    public function getAll() {
        return $this->model->getAll();
    }

    public function add($especie) {
        $this->model->add($especie);
    }

    public function update($id, $especie) {
        $this->model->update($id, $especie);
    }

    public function delete($id) {
        $this->model->delete($id);
    }
}
?>