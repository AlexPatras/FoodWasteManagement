import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faDonate, faComments, faUser, faUsers, faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import "../pages/style/Nav.css";

const BlogNav = () => {
    const [isOpen, setIsOpen] = useState(false);
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove token from localStorage
        window.location.href = '/login'; // Redirect to login page
    };

    return (
        <>
            <div className='nav-container'>
                <Nav className='nav-center'>
                    <LinkContainer to="/">
                        <Nav.Link className="nav-button">
                            <FontAwesomeIcon icon={faHome} size="2x" /> <span>Home</span>
                        </Nav.Link>
                    </LinkContainer>
                    <LinkContainer to="/Donate">
                        <Nav.Link className="nav-button">
                            <FontAwesomeIcon icon={faDonate} size="2x" /> <span>Donate</span>
                        </Nav.Link>
                    </LinkContainer>
                    <LinkContainer to="/Chats">
                        <Nav.Link className="nav-button">
                            <FontAwesomeIcon icon={faComments} size="2x" /> <span>Chats</span>
                        </Nav.Link>
                    </LinkContainer>
                    <LinkContainer to="/account">
                        <Nav.Link className="nav-button">
                            <FontAwesomeIcon icon={faUser} size="2x" /> <span>Account</span>
                        </Nav.Link>
                    </LinkContainer>
                    <LinkContainer to="/community">
                        <Nav.Link className="nav-button">
                            <FontAwesomeIcon icon={faUsers} size="2x" /> <span>Community</span>
                        </Nav.Link>
                    </LinkContainer>
                    {token ? ( // Render Logout if token exists
                        <Nav.Link className="nav-button" onClick={handleLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} size="2x" /> <span>Logout</span>
                        </Nav.Link>
                    ) : ( // Render Login if token does not exist
                        <LinkContainer to="/login">
                            <Nav.Link className="nav-button">
                                <FontAwesomeIcon icon={faSignInAlt} size="2x" /> <span>Login</span>
                            </Nav.Link>
                        </LinkContainer>
                    )}
                </Nav>
            </div>

            <div className='nav-containerPhone'>
                <div className="sidebar-header">
                    <button onClick={() => setIsOpen(!isOpen)} className="menu-toggle">
                        Menu
                    </button>
                </div>
                <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                    <div className="sidebar-nav">
                        <Nav className="flex-column">
                            <LinkContainer to="/">
                                <Nav.Link className="sidebar-button"><FontAwesomeIcon icon={faHome} size="lg" /> Home</Nav.Link>
                            </LinkContainer>
                            <LinkContainer to="/Donate">
                                <Nav.Link className="sidebar-button"><FontAwesomeIcon icon={faDonate} size="lg" /> Donate</Nav.Link>
                            </LinkContainer>
                            <LinkContainer to="/Chats">
                                <Nav.Link className="sidebar-button"><FontAwesomeIcon icon={faComments} size="lg" /> Chats</Nav.Link>
                            </LinkContainer>
                            <LinkContainer to="/account">
                                <Nav.Link className="sidebar-button"><FontAwesomeIcon icon={faUser} size="lg" /> Account</Nav.Link>
                            </LinkContainer>
                            <LinkContainer to="/community">
                                <Nav.Link className="sidebar-button"><FontAwesomeIcon icon={faUsers} size="lg" /> Community</Nav.Link>
                            </LinkContainer>
                            {token ? ( // Render Logout if token exists
                                <Nav.Link className="sidebar-button" onClick={handleLogout}>
                                    <FontAwesomeIcon icon={faSignOutAlt} size="lg" /> Logout
                                </Nav.Link>
                            ) : ( // Render Login if token does not exist
                                <LinkContainer to="/login">
                                    <Nav.Link className="sidebar-button"><FontAwesomeIcon icon={faSignInAlt} size="lg" /> Login</Nav.Link>
                                </LinkContainer>
                            )}
                        </Nav>
                    </div>
                </div>
            </div>
        </>
    );
}

export default BlogNav;
