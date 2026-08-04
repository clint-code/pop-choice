import React from 'react';
import popChoiceLogo from '/assets/img/PopChoice-Icon.png';

export default function Header() {
    return (
        <>

            <header>
                <div className="logo-section">
                    <img 
                        src={popChoiceLogo} 
                        alt="pop-choice"
                        width={99}
                        height={108} />
                    <h1>PopChoice</h1>
                </div>
            </header>

        </>
    );
}

