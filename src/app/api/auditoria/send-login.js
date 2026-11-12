import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
    try {
        const { email } = await request.json();

        const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "parocruz18@gmail.com",
            pass: "123456",
        },
        });

        const mailOptions = {
        from: '"educa360" <parocruz18@gmail.com>',
        to: email,
        subject: "Acceso a Educa360",
        text: "Hola, has accedido al proyecto de Educa360",
        html: "<p>Hola, has accedido al proyecto de Educa360</p>",
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: "Correo enviado con éxito" });
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}