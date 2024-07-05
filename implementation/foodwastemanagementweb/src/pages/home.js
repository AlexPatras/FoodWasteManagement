import React from "react";

const Home = () => {
    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="content" style={{ width: '80%', maxWidth: 1200, padding: 20, background: 'white', borderRadius: 10, boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }}>
                <h1>Welcome to foodwaste management</h1>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pulvinar ligula quis malesuada vulputate. 
                    Nam condimentum quam vitae est blandit, non auctor velit tempor. Cras sodales, sapien ac volutpat luctus, 
                    odio nunc eleifend tellus, vel feugiat neque quam in sapien. Suspendisse potenti. Morbi accumsan felis a 
                    ultricies sollicitudin. Nam dictum suscipit nibh, ac tristique nisl sollicitudin id. 
                </p>
                <p>
                    Donec non nisl in libero feugiat feugiat. Sed tempus est vitae justo facilisis hendrerit. 
                    Nulla sollicitudin ipsum at orci consequat, vel condimentum lacus varius. Nam sit amet mauris 
                    eu nibh elementum fermentum. Nulla facilisi. Pellentesque at sapien vel nunc viverra fringilla. 
                    Proin fringilla justo in pulvinar convallis. Vestibulum at neque nisl. Integer convallis bibendum justo, 
                    nec facilisis tortor cursus at. 
                </p>
                <p>
                    Suspendisse vel mauris dui. Nullam hendrerit elit nec placerat sodales. Donec fermentum sapien et eros dapibus, 
                    nec aliquet risus feugiat. Maecenas ac orci sem. Proin nec elit enim. Aenean id ipsum nec risus tempor sollicitudin. 
                    Duis consectetur sem eget eros tristique, sit amet suscipit turpis vestibulum. Sed finibus consequat justo, 
                    vel ullamcorper sapien tristique nec.
                </p>
            </div>
        </div>
    );
};

export default Home;
