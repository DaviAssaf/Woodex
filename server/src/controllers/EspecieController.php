<?php

require_once __DIR__ . '/../models/EspecieModel.php';

class EspecieController
{
    private $model;

    public function __construct()
    {
        $this->model = new EspecieModel();
    }

    public function getAll(): array
    {
        return $this->model->getAll();
    }

    public function checkConnection(): array
    {
        return $this->model->checkConnection();
    }

    public function add(array $especie): array
    {
        return $this->model->add($especie);
    }

    public function update(int $id, array $especie): array
    {
        return $this->model->update($id, $especie);
    }

    public function delete(int $id): void
    {
        $this->model->delete($id);
    }
}
