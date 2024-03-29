import React, {useState, useEffect} from 'react';
import { Box, Button, Card, TextField, Typography } from '@material-ui/core';
import EmptyList from '../components/atoms/EmptyList';
import UserSearchListItem from '../components/atoms/UserSearchListItem';
import UserParticipatingListItem from '../components/atoms/UserParticipatingListItem';
import Action from '../components/atoms/Action';
import firebase from '../firebase/config';
import { newSessionFormStyles } from '../styles/sessionStyles';

export default function SessionsCreatePanel({authUser, dataUser, changeTab}) {
    const classes = newSessionFormStyles();

    const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

    const usersRef = firebase.firestore().collection('users');
    const sessionsRef = firebase.firestore().collection('sessions');

    const now = new Date();
    console.log(now.getMonth())
    // const nowFormatted = `${monthNames[now.getMonth()]}-${now.getDate()}-${now.getFullYear()}T${now.getHours()}:${now.getMinutes()}`;  
    const nowFormatted = `${now.getFullYear()}-${now.getMonth() > 10 ? (now.getMonth()+1) : '0' + (now.getMonth()+1) }-${now.getDate() > 9 ? now.getDate() : '0' + now.getDate()}T${now.getHours() > 9 ? now.getHours() : '0' + now.getHours()}:${now.getMinutes() > 9 ? now.getMinutes() : '0' + now.getMinutes()}`;  
    console.log("nowFormatted: ", nowFormatted)
    const [name, setName] = useState("")
    const [notes, setNotes] = useState("")
    const [startDateTime, setStartDateTime] = useState(nowFormatted);
    const [startDateTimeEdited, setStartDateTimeEdited] = useState(false)
    const [duration, setDuration] = useState(0)
    const [location, setLocation] = useState("")
    const [participant, setParticipant] = useState({})

    const [formDataValidationPassed, setFormDataValidationPassed] = useState(false)
    useEffect(() => {
        // dynamic data validation
        if(name !== "" && participant.username ) {
            // sessionsRef.where("userId")
            setFormDataValidationPassed(true)
        } else {
            setFormDataValidationPassed(false)
        }
    }, [name, participant]) // fields to validate
    // SEARCH Users; Push to Array
    const [searchResultUsers, setSearchResultUsers] = useState([])
    const [userSearchValue, setUserSearchValue] = useState('')
    useEffect(() => {
        if (userSearchValue.length > 1) {
            usersRef
                .where('connectionUserIds', 'array-contains-any', [dataUser.id])
                .onSnapshot(querySnapshot => {
                    const userResult = []
                    querySnapshot.forEach(doc => {
                        if (
                            doc.data().firstName.includes(userSearchValue) || 
                            doc.data().lastName.includes(userSearchValue) ||
                            doc.data().username.includes(userSearchValue) ||
                            doc.data().email.includes(userSearchValue)
                        ) {
                            userResult.push(doc.data())
                        }
                    })
                    setSearchResultUsers(userResult);
                })
        } else {
            setSearchResultUsers([])
        }
    }, [userSearchValue])
    // ADD USER as Participant
    const addParticipant = (user) => {
        setParticipant(user)
        setUserSearchValue("") 
    }
    
    // SUBMIT + REDIRECT
    // const [newSessionId, setNewSessionId] = useState("")
    const createSession = (e) => {
        // data validation
        sessionsRef
            .add({
                coachUserId: authUser.uid,
                coachUsername: dataUser.username,
                durationMinutes: duration,
                lastOrderIndex: 100,
                location: location,
                name: name,
                notes: notes,
                participantUserId: [dataUser.id, participant.id],
                participantUsername: [dataUser.username, participant.username],
                startDateTime: startDateTime,
                status: 'draft',
                type: 'personal',
            }).then(docRef => {
                sessionsRef.doc(docRef.id).update({
                    id: docRef.id,
                })
                usersRef.doc(authUser.uid).update({
                    sessions: firebase.firestore.FieldValue.arrayUnion(docRef.id),
                })
        })
    }
    // console.log("userSearchValue", userSearchValue)
    return (
        <Box className={classes.container}>
            <Card className={classes.sessionDetails}>
                {/* Session Info */}
                <Typography className={classes.label}>Create a session with a client: </Typography>
                <TextField className={classes.field} id="name" label="New Session Name: *" value={name} onChange={(e) => setName(e.target.value)} />
                <Box className={classes.dateTime}>
                    {/* Date & Time */}
                    <TextField
                        id="datetime-local"
                        label="Start Date and Time"
                        type="datetime-local"
                        value={startDateTime}
                        // value={startDateTimeEdited ? startDateTime : startDateTime.toISOString().substr(0,16)}
                        // setStartDateTime
                        onChange={(e) => {
                            setStartDateTimeEdited(true)
                            setStartDateTime(e.target.value)
                            console.log(e.target.value)
                        }}
                        // defaultValue={nowToString}
                        className={classes.startDateTime}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    {/* Duration */}
                    <TextField className={classes.duration} id="duration" label="Duration: " value={duration} onChange={(e) => setDuration(e.target.value)} />
                </Box>
                {/* Location */}
                <TextField className={classes.field} id="location" label="Location: " value={location} onChange={(e) => setLocation(e.target.value)} />

                <TextField className={classes.field} id="notes" label="Notes: " value={notes} onChange={(e) => setNotes(e.target.value)} />
                
                {/* Participating Clients */}
                <Typography className={classes.label}>Participant: </Typography>
                {
                    participant?.username
                    ? <UserParticipatingListItem user={participant} setParticipant={setParticipant} />
                    : <EmptyList message={'No participants selected.'}/> 
                }
                  
                {/* User SEARCH */}
                <TextField 
                    className={classes.searchField} 
                    id="searchField" 
                    label='Search your connections. Start typing... *' 
                    value={userSearchValue} 
                    onChange={(e) => setUserSearchValue(e.target.value)} 
                />
                {/* Search Result - List clients */}
                {   
                    userSearchValue &&
                    <Box>
                    { 
                        searchResultUsers.length > 0 
                        ? searchResultUsers.map((user, index) => <UserSearchListItem key={index} user={user} addUser={addParticipant} listToAppend={[participant]} />)
                        : <EmptyList message={'No search results.'}/>                     
                    }
                    </Box>
                }

                <Box className={classes.sessionActionsButtions}>
                    {!formDataValidationPassed && <Typography>Fields marked with * are required</Typography>}
                    <Button 
                        disabled={!formDataValidationPassed}
                        className={classes.buttonPrimary} 
                        onClick={(e) => {
                            createSession(e)
                            changeTab(e, 2) // go to Drafts tab
                        }}
                    >Create Draft Session</Button>
                </Box>
            </Card>
        </Box>
    )
}
