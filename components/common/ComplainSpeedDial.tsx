import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import {SiMinutemailer} from "react-icons/si";
import React, {useState} from "react";
import FeedbackDialog from "@/components/common/FeedbackDialog";
import {GiWaterBottle} from "react-icons/gi";
import {VscFeedback} from "react-icons/vsc";
import {RequestDialog} from "@/components/common/RequestDialog";


export default function BasicSpeedDial() {
    const actions = [
        {
            icon: <GiWaterBottle/>, name: ' Phản hồi ', onclick: () => {
                setOpenComplain(true)
            }
        },
        {
            icon: <VscFeedback/>, name: ' Yêu cầu ', onclick: () => {
                setOpenFeedback(true)
            }
        },
    ];
    const [openComplain, setOpenComplain] = useState<boolean>(false);
    const [openFeedback, setOpenFeedback] = useState<boolean>(false);

    return (
        <>
            <Box sx={{height: 320, transform: 'translateZ(0px)', flexGrow: 1}}>
                <SpeedDial
                    ariaLabel="SpeedDial basic example"
                    sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        '& .MuiFab-root': {
                            backgroundColor: '#4F966C',
                            color: '#fff',
                            '&:hover': {
                                backgroundColor: '#64B76A',
                            },
                        },
                    }}
                    icon={<SiMinutemailer/>}
                >

                    {actions.map((action) => (
                        <SpeedDialAction
                            key={action.name}
                            icon={action.icon}
                            slotProps={{
                                tooltip: {
                                    title: action.name,
                                },
                            }}
                            onClick={action.onclick}
                        />
                    ))}
                </SpeedDial>
            </Box>

            <FeedbackDialog
                isOpen={openComplain}
                onClose={() => setOpenComplain(false)}
            />

            <RequestDialog open={openFeedback} onClose={() => setOpenFeedback(false)}/>
        </>

    );
}
