<template>
  <div class="login-container">
    <img src="../../public/images/HORAGÁ_title_1.svg" alt="HORAGÁ" />
    <form class="login-form" @submit.prevent="handleLogin">
      <div class="form__group">
        <input
          v-model="email"
          type="email"
          class="form__field"
          placeholder=" "
          id="email"
          autocomplete="email"
          required
        />
        <label for="email" class="form__label">E-mail</label>
      </div>

      <div class="form__group">
        <input
          v-model="password"
          type="password"
          class="form__field"
          placeholder=" "
          id="password"
          autocomplete="current-password"
          required
        />
        <label for="password" class="form__label">Senha</label>
      </div>

      <button type="submit">Entrar</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  setup() {
    const email = ref('')
    const password = ref('')
    const router = useRouter()

    const handleLogin = () => {
      if (email.value === 'admin@admin' && password.value === 'admin') {
        router.push('/app') // ✅ Alterado para /app (rota do Layout)
      } else {
        alert('E-mail ou senha inválidos!')
      }
    }

    return {
      email,
      password,
      handleLogin
    }
  }
}
</script>

<style scoped>
/* Estilo da logo */
img {
  max-height: 80px;
  margin-bottom: 30px;
  margin-top: 30px;
}

/* Container principal */
.login-container {
  width: 90%;
  max-width: 400px;
  padding: 32px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px rgba(172, 132, 220, 0.25);
  color: #ffffff;
  text-align: center;
}

/* Formulário */
.login-form {
  width: 100%;
}

/* Floating label */
.form__group {
  position: relative;
  padding: 20px 0 0;
  margin-bottom: 24px;
  width: 100%;
}

.form__field {
  font-family: inherit;
  width: 100%;
  border: none;
  border-bottom: 2px solid #b59de9;
  outline: 0;
  font-size: 17px;
  color: #ffffff;
  padding: 7px 0;
  background: transparent;
  transition: border-color 0.2s;
}

.form__field::placeholder {
  color: transparent;
}

.form__label {
  position: absolute;
  top: 0;
  display: block;
  transition: 0.2s;
  font-size: 17px;
  color: #b59de9;
  pointer-events: none;
}

.form__field:placeholder-shown ~ .form__label {
  font-size: 17px;
  cursor: text;
  top: 20px;
}

.form__field:focus,
.form__field:not(:placeholder-shown) {
  padding-bottom: 6px;
  font-weight: 700;
  border-width: 3px;
  border-image: linear-gradient(to right, #ac84dc, #d5b8f0);
  border-image-slice: 1;
}

.form__field:focus ~ .form__label,
.form__field:not(:placeholder-shown) ~ .form__label {
  top: 0;
  font-size: 17px;
  color: #ac84dc;
  font-weight: 700;
}

/* Botão */
.login-container button {
  width: 100%;
  padding: 14px;
  margin-top: 16px;
  border: none;
  border-radius: 10px;
  background: #ac84dc;
  color: white;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.login-container button:hover {
  background: #9b76e0;
}

/* Reset de validação do navegador */
.form__field:required,
.form__field:invalid {
  box-shadow: none;
}
</style>