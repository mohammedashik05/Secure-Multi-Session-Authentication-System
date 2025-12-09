let navigationfunction =null;

export const setNavigator =(nav)=>{
    navigationfunction=nav;
}

export const navigateTo =(path)=>{
    if(navigationfunction)
        navigationfunction(path);
}