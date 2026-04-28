<?php

class UserModel
{
    private $conn;

    public function __construct()
    {
        $this->conn = require __DIR__ . '/../config/config.php';
    }

    public function authenticate(string $username, string $password): array
    {
        $username = trim($username);

        if ($username === '' || $password === '') {
            throw new InvalidArgumentException('Informe usuario e senha.');
        }

        $sql = '
            SELECT id, username, password
            FROM users
            WHERE username = ?
            LIMIT 1
        ';
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();

        if (!$user || !$this->passwordMatches($password, (string) ($user['password'] ?? ''))) {
            throw new AuthenticationException('Usuario ou senha invalidos.');
        }

        return [
            'id' => (int) $user['id'],
            'username' => (string) $user['username'],
        ];
    }

    private function passwordMatches(string $password, string $storedPassword): bool
    {
        if ($storedPassword === '') {
            return false;
        }

        if (!$this->isBcryptHash($storedPassword)) {
            return false;
        }

        return password_verify($password, $storedPassword);
    }

    private function isBcryptHash(string $storedPassword): bool
    {
        return preg_match('/^\$2[aby]\$\d{2}\$[\.\/A-Za-z0-9]{53}$/', $storedPassword) === 1;
    }
}
