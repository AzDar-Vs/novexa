<?php
session_start();
require_once '../config/database.php';

$error = '';
$success = '';
$current_form = 'login'; // Default form

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // REGISTER
  if ($_POST['type'] === 'register') {
    $nama = $_POST['nama'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $role = 'buyer';

    $cek = $pdo->prepare("SELECT id FROM users WHERE email=?");
    $cek->execute([$email]);

    if ($cek->rowCount() > 0) {
      $error = "Email sudah terdaftar";
    } else {
      $stmt = $pdo->prepare("
        INSERT INTO users (nama,email,password,role,created_at)
        VALUES (?,?,?,?,NOW())
      ");
      $stmt->execute([$nama,$email,$password,$role]);
      $success = "Register berhasil, silakan login!";
      $current_form = 'login';
    }
  }

  // LOGIN
  if ($_POST['type'] === 'login') {
    $email = $_POST['email'];
    $password = $_POST['password'];

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email=?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {

  // Simpan session user (AMAN)
    $_SESSION['user'] = [
        'id' => $user['id'],
        'nama' => $user['nama'],
        'email' => $user['email'],
        'role' => $user['role'],
        'created_at' => $user['created_at']
      ];

      // Redirect berdasarkan role
      if ($user['role'] === 'seller') {
        header("Location: ../seller/dashboard.php");
      } elseif ($user['role'] === 'admin') {
        header("Location: ../admin/dashboard.php");
      } else {
        header("Location: ../buyer/dashboard.php");
      }
    exit;

    } else {
    $error = "Email atau password salah";
    $current_form = 'login';
    }
  }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Novexa - Sign In & Sign Up</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="../assets/css/auth.css" rel="stylesheet">
</head>
<body>

<div class="auth-wrapper">
  <div class="auth-container <?php echo $current_form === 'register' ? 'right-panel-active' : ''; ?>" id="auth-container">
    
    <!-- SIGN UP FORM -->
    <div class="form-container sign-up-container">
      <form method="POST" id="registerForm">
        <h2 class="auth-title">Create Account</h2>
        
        <div class="social-container">
          <a href="#" class="social"><i class="fab fa-facebook-f"></i></a>
          <a href="#" class="social"><i class="fab fa-google-plus-g"></i></a>
          <a href="#" class="social"><i class="fab fa-linkedin-in"></i></a>
        </div>
        
        <span class="auth-subtitle">or use your email for registration</span>
        
        <?php if($error && $current_form === 'register'): ?>
          <div class="alert alert-danger alert-auth"><?= $error ?></div>
        <?php endif; ?>
        <?php if($success): ?>
          <div class="alert alert-success alert-auth"><?= $success ?></div>
        <?php endif; ?>
        
        <input type="hidden" name="type" value="register">
        <input type="text" name="nama" placeholder="Name" required class="auth-input" />
        <input type="email" name="email" placeholder="Email" required class="auth-input" />
        
        <div class="password-container">
          <input type="password" name="password" id="registerPassword" placeholder="Password" required class="auth-input password-input" />
          <span class="toggle-password" data-target="registerPassword">
            <i class="far fa-eye"></i>
          </span>
        </div>
        
        <div class="password-strength mt-2">
          <div class="strength-bar">
            <div class="strength-fill" id="passwordStrength"></div>
          </div>
          <small class="strength-text" id="passwordStrengthText">Password strength</small>
        </div>
        
        <button type="submit" class="auth-button">SIGN UP</button>
      </form>
    </div>

    <!-- SIGN IN FORM -->
    <div class="form-container sign-in-container">
      <form method="POST" id="loginForm">
        <h2 class="auth-title">Sign in</h2>
        
        <div class="social-container">
          <a href="#" class="social"><i class="fab fa-facebook-f"></i></a>
          <a href="#" class="social"><i class="fab fa-google-plus-g"></i></a>
          <a href="#" class="social"><i class="fab fa-linkedin-in"></i></a>
        </div>
        
        <span class="auth-subtitle">or use your account</span>
        
        <?php if($error && $current_form === 'login'): ?>
          <div class="alert alert-danger alert-auth"><?= $error ?></div>
        <?php endif; ?>
        
        <input type="hidden" name="type" value="login">
        <input type="email" name="email" placeholder="Email" required class="auth-input" />
        
        <div class="password-container">
          <input type="password" name="password" id="loginPassword" placeholder="Password" required class="auth-input password-input" />
          <span class="toggle-password" data-target="loginPassword">
            <i class="far fa-eye"></i>
          </span>
        </div>
        
        <a href="#" class="forgot-link">Forgot your password?</a>
        <button type="submit" class="auth-button">SIGN IN</button>
      </form>
    </div>

    <!-- OVERLAY CONTAINER -->
    <div class="overlay-container">
      <div class="overlay">
        <div class="overlay-panel overlay-left">
          <h2 class="overlay-title">Welcome Back!</h2>
          <p class="overlay-text">
            To keep connected with us please login with your personal info
          </p>
          <button class="ghost auth-button" id="signIn">SIGN IN</button>
        </div>
        <div class="overlay-panel overlay-right">
          <h2 class="overlay-title">Hello, Friend!</h2>
          <p class="overlay-text">
            Enter your personal details and start your journey with us
          </p>
          <button class="ghost auth-button" id="signUp">SIGN UP</button>
        </div>
      </div>
    </div>

  </div>

  <!-- BRANDING -->
  <div class="brand-container">
    <a href="../" class="back-home">
      <i class="fas fa-arrow-left"></i> Back to Home
    </a>
    <div class="brand-logo">
      <i class="fas fa-book-open"></i>
      <span>NOVEXA</span>
    </div>
    <p class="brand-tagline">Platform Buku Digital Terdepan</p>
  </div>
</div>

<script src="../assets/js/auth.js"></script>
</body>
</html>