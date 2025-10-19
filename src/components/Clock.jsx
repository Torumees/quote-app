import { useEffect, useState } from "react";

export default function Clock() {
    const [time, setTime] = useState(new Date());

    // uuendab aega iga sekund
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const hours = time.getHours();

    let greeting = "";
    if(hours < 12) greeting = "Tere hommikust!";
    else if(hours < 18) greeting = "Tere päevast!";
    else greeting = "Tere õhutust!";

    return (
        <div style={{ textAlign: "center", marginTop: 40}}>
            <h2>{greeting}</h2>
            <p>{time.toLocaleTimeString()}</p>
        </div>
    );
}