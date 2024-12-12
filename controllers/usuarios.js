const Usuario = require('../modelos/usuario');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configuración de Nodemailer (codigo agregado para mail de verificacion)
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Usa Gmail o cualquier otro servicio SMTP
    auth: {
        user: process.env.EMAIL_USER,  // Tu correo de envío
        pass: process.env.EMAIL_PASS   // Tu contraseña o app password
    }
});
// Función para generar un token único
function generarTokenVerificacion() {
    return crypto.randomBytes(20).toString('hex');
}

// Función para manejar la verificación del correo
module.exports.verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const usuario = await Usuario.findOne({ verificationToken: token });

        if (!usuario) {
            return res.status(400).send('Token de verificación inválido o expirado.');
        }

        // Verificación exitosa: activar la cuenta
        usuario.isVerified = true;
        usuario.verificationToken = undefined;  // Borra el token
        await usuario.save();

     // Redirigir al usuario a la página de login con un mensaje de éxito
     req.flash('success', 'Tu cuenta ha sido verificada exitosamente. ¡Ya puedes iniciar sesión!');
     res.redirect('/login');  // O redirige a otra página que desees, como la página de inicio
    } catch (err) {
        console.log(err);
        res.status(500).send('Error en el proceso de verificación');
    }
};

module.exports.registerForm = (req, res) => {
    res.render('usuarios/registro', {title: 'Nuevo Usuario'});
};

module.exports.registro = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const usuario = new Usuario({ email, username, isVerified: false });
        const registroUsuario = await Usuario.register(usuario, password);
        console.log(registroUsuario);

        // Generar un token de verificación
        const token = generarTokenVerificacion();
        
        // Guarda el token en el usuario (puedes agregar una propiedad en el modelo)
        usuario.verificationToken = token;
        await usuario.save();
        // Crear el enlace de verificación, usa una variable de entorno para el dominio
        const verificationUrl = `${process.env.SITE_URL}/verify/${token}`;
  
        // Configurar el correo
        const mailOptions = {
            from: process.env.EMAIL_USER,  // Usar el correo de la variable de entorno
            to: email,  // Correo del usuario registrado
            subject: 'Verifica tu correo electrónico',
            text: `Por favor, haz clic en el siguiente enlace para verificar tu cuenta: ${verificationUrl}`,
            html: `<p>Por favor, haz clic en el siguiente enlace para verificar tu cuenta: <a href="${verificationUrl}">Verificar cuenta</a></p>`
        };

        // Enviar el correo
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error al enviar el correo de verificación: ', error);
                return res.status(500).send('Error al enviar el correo de verificación');
            }
            console.log('Correo de verificación enviado: ' + info.response);
           
            // Redirigir al usuario a la página de "Revisa tu correo"
            res.render('usuarios/esperaVerificacion', {title: 'Verificación Pendiente'});
           
        });

    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/registro');
    }
};



module.exports.renderLoginForm = (req, res) => {
    res.render('usuarios/login', {title: 'Login Usuario'});
};


module.exports.login = (req, res) => {
    req.flash('success', 'Bienvenido de nuevo a Bibliotecas Populares Córdoba');
    const redirectUrl = res.locals.returnTo || '/bibliotecas';
    // delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Nos vemos!');
        res.redirect('/bibliotecas');
    });
};

