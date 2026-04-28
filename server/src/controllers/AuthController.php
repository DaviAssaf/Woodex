<?php

require_once __DIR__ . '/../models/UserModel.php';

class AuthController
{
    private $model;

    public function __construct()
    {
        $this->model = new UserModel();
    }

    public function login(string $username, string $password): array
    {
        $user = $this->model->authenticate($username, $password);

        session_regenerate_id(true);
        $_SESSION['user'] = $user;

        return $user;
    }

    public function logout(): void
    {
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();

            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }

        session_destroy();
    }

    public function isAuthenticated(): bool
    {
        return isset($_SESSION['user']['id'], $_SESSION['user']['username']);
    }

    public function getAuthenticatedUser(): ?array
    {
        if (!$this->isAuthenticated()) {
            return null;
        }

        return [
            'id' => (int) $_SESSION['user']['id'],
            'username' => (string) $_SESSION['user']['username'],
        ];
    }

    public function requireAuthentication(): void
    {
        if (!$this->isAuthenticated()) {
            throw new AuthenticationException('Autenticacao necessaria.');
        }
    }
}
