import { ChevronDown, CircleUserRound } from "lucide-react";
import "./AppBar.css";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function AppBar({
    navList = [],
    userMenuList = [],
}: {
    navList?: { path: string, name: string }[],
    userMenuList?: { path: string, name: string }[]
}) {
    const [navExpand, setNavExpand] = useState(false);
    const [userMenuExpand, setUserMenuExpand] = useState(false);
    const navRef = useRef<HTMLElement | null>(null);
    const userRef = useRef<HTMLElement | null>(null);
    const [pageName, setPageName] = useState(navList[0].name);

    function handleClickMenu(e: React.MouseEvent) {
        setNavExpand(isExpand => !isExpand);
        setUserMenuExpand(false);
    }

    function handleClickUserIcon(e: React.MouseEvent) {
        setUserMenuExpand(isExpand => !isExpand);
        setNavExpand(false);
    }

    useEffect(() => {
        if (!navRef.current)
            return;

        const el = navRef.current;
        el.style.height = navExpand ? el.scrollHeight.toString() + 'px' : '0px';
    }, [navList, navExpand]);

    useEffect(() => {
        if (!userRef.current)
            return;

        const el = userRef.current;
        el.style.height = userMenuExpand ? el.scrollHeight.toString() + 'px' : '0px';
    }, [userMenuList, userMenuExpand]);

    return (
        <div className="app-bar">
            <nav className="navigation-bar" ref={navRef} data-expand={navExpand} onClick={() => setNavExpand(false)}>
                {navList.map((val, idx) => <Link key={idx} to={val.path} onClick={() => setPageName(val.name)}>{val.name}</Link>)}
            </nav>
            <nav className="user-menu-bar" ref={userRef} data-expand={userMenuExpand} onClick={() => setUserMenuExpand(false)}>
                {userMenuList.map((val, idx) => <Link key={idx} to={val.path} onClick={() => setPageName(val.name)}>{val.name}</Link>)}
            </nav>
            <div className="content">
                <ChevronDown className="menu-icon" onClick={handleClickMenu}
                    style={{
                        ...(navExpand && { transform: 'rotate(-180deg)' })
                    }}
                />
                <a className="page-title" href="">{pageName}</a>
                <CircleUserRound className="user-icon" onClick={handleClickUserIcon} data-expand={userMenuExpand} />
            </div>
        </div>
    );
}