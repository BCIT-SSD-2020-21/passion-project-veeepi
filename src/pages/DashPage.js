import React, {useState} from 'react';
import AppBar from '@material-ui/core/AppBar';
import TabPanel from '../containers/TabPanel';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import UserBanner from '../containers/UserBanner';
import UserConnections from '../containers/UserConnections';
import SessionsPanel from '../containers/SessionsPanel';
import Footer from '../containers/Footer';
import SessionsCreatePanel from '../containers/SessionCreatePanel';
import { Box } from '@material-ui/core';
import { pageStyles } from '../styles/dashStyles';

export default function DashPage({authUser, dataUser}) {
    const classes = pageStyles();

    const [value, setValue] = useState(0);
    const [selectedTabTitle, setSelectedTabTitle] = useState('Upcoming');
    const changeTab = (event, newValue) => {
        setValue(newValue);
        if (newValue === 0) { 
            setSelectedTabTitle('Upcoming')
        }
        if (newValue === 1) {
            setSelectedTabTitle('Completed')
        }
        if (newValue === 2) {
            setSelectedTabTitle('Drafts')
        }
        if (newValue === 3) {
            setSelectedTabTitle('Create Session')
        }
    };

    return (
        <Box className={classes.container}>
            <Box classes={classes.header}>
                <UserBanner dataUser={dataUser} />
                <UserConnections dataUser={dataUser}/>
            </Box>
            <AppBar className={classes.appBar} position="static">
                <Tabs
                    className={classes.tabs}
                    value={value}
                    onChange={changeTab}
                    centered
                >
                    <Tab className={classes.tab} label="Upcoming" />
                    <Tab className={classes.tab} label="Completed" />
                    {
                        dataUser?.userType === 'coach' &&
                        <Tab className={classes.tab} label="Drafts" />
                    }

                    {
                        dataUser?.userType === 'coach' &&
                        <Tab className={classes.tab} label="Create Session" />
                    }
                </Tabs>
            </AppBar>
            <TabPanel value={value} index={0}>
                <SessionsPanel authUser={authUser} dataUser={dataUser} sessionStatus={'upcoming'} changeTab={changeTab} />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <SessionsPanel authUser={authUser} dataUser={dataUser} sessionStatus={'completed'} changeTab={changeTab} />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <SessionsPanel authUser={authUser} dataUser={dataUser} sessionStatus={'draft'} changeTab={changeTab} />
            </TabPanel>
            <TabPanel value={value} index={3}>
                <SessionsCreatePanel authUser={authUser} dataUser={dataUser} changeTab={changeTab} />
            </TabPanel>
            <Footer />
        </Box>
    )
}
