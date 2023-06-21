import express, { Request, Response } from "express";

type NameEmailData = {
  name: string;
  email: string;
  errorMessages: string | string[];
};

const storedData: NameEmailData[] = [];
let dataMessages: string[] | string = [];

const app = express();
const port = 8081;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req: Request, res: Response) => {
  res.sendFile("./index.html", { root: __dirname });
});

app.get("/data", (req: Request, res: Response) => {
  const data = {
    storedData,
    dataMessages,
  };
  res.json(data);
});

app.post("/submit", async (req: Request, res: Response) => {
  const { name, email } = req.body;

  function verifyInvalidCharacter(email: string): boolean {
    const charactersNotAllowed = [" ", ",", ";", ":", "!", "?", "'", "\"", "+", "-", "_", "*", "/", "$", "%", "&", "=", "\r", "\n", "\t"];
    for (let i = 0; i < email.length; i++) {
      if (email[i].includes(".")) {
        const beforeDot = email[i - 1];
        const afterDot = email[i + 1];
        if (charactersNotAllowed.some((n) => n === afterDot) || charactersNotAllowed.some((n) => n === beforeDot)) {
          return false;
        }
      }
    }
    return true;
  }

  function consecutivePeriods(email: string): boolean {
    for (let i = 0; i < email.length - 1; i++) {
      if (email.charAt(i) === "." && email.charAt(i + 1) === ".") {
        return false;
      }
    }
    return true;
  }

  function validateAtSign(email: string): boolean {
    let countAtSign = 0;

    for (let i = 0; i < email.length; i++) {
      if (email[i] === "@") {
        countAtSign += 1;
      }
      if (countAtSign >= 2) {
        return false;
      }
    }
  
    return true;
  }

  function validateEmail(email: string): { result: true } | { result: false; messages: string[] } {
    const separator = email.indexOf("@");
  
    const localPart = email.substring(0, separator);
    const domainPart = email.substring(separator + 1);
    const lastWord = email[email.length - 1];
  
    const messages: string[] = [];
  
    if (localPart.length > 64) {
      messages.push("La parte local debe ser menor a 64 caracteres");
    }
  
    if (email.includes(" ")) {
      messages.push("El correo no puede contener espacios");
    }
  
    if (!email.includes("@")) {
      messages.push("El correo debe contener una arroba");
    }
  
    if (localPart.startsWith(".")) {
      messages.push("El correo no puede iniciar con un punto");
    }
  
    if (localPart.endsWith(".")) {
      messages.push("La parte local no puede finalizar con un punto");
    }
  
    if (localPart.startsWith("_")) {
      messages.push("El correo no puede iniciar con un guión bajo");
    }
  
    if (localPart.endsWith("_")) {
      messages.push("La parte local no puede finalizar con un guión bajo");
    }
  
    if (localPart.startsWith("-")) {
      messages.push("El correo no puede iniciar con un guión regular");
    }
  
    if (localPart.endsWith("-")) {
      messages.push("La parte local no puede finalizar con un guión regular");
    }
  
    if (domainPart.startsWith("-")) {
      messages.push("La parte del dominio no puede iniciar con un guión regular");
    }
  
    if (domainPart.startsWith(".")) {
      messages.push("La parte del dominio no puede iniciar con un punto");
    }
  
    if (domainPart.startsWith("_")) {
      messages.push("La parte del dominio no puede iniciar con un guión bajo");
    }
  
    if (!consecutivePeriods(localPart)) {
      messages.push("La parte local no puede contener puntos consecutivos");
    }

    if (!consecutivePeriods(domainPart)) {
      messages.push("La parte del dominio no puede contener puntos consecutivos");
    }
  
    if (domainPart.length > 255) {
      messages.push("La parte del dominio debe contener menos de 255 caracteres");
    }
  
    if (!validateAtSign(email)) {
      messages.push("Verifica que tu correo contenga una sola arroba");
    }
  
    if (!domainPart.includes(".")) {
      messages.push("La parte del dominio debe incluir al menos un punto");
    }
  
    if (!verifyInvalidCharacter(domainPart)) {
      messages.push("La parte del dominio contiene caracteres no permitidos");
    }
  
    if (!(lastWord.toUpperCase() !== lastWord.toLowerCase())) {
      messages.push("Tu extensión de dominio debería incluir solo letras");
    }
  
    if (messages.length > 0) {
      return { result: false, messages: messages };
    } else {
      return { result: true };
    }
  }
  
  console.log(`Received form submission: Name - ${name}, Email - ${email}`);
  const validEmail = validateEmail(email);

  storedData.push({ name, email, errorMessages: validEmail.result ? "Valido" : validEmail.messages });

  console.log(storedData);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
