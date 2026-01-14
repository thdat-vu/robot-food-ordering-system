"use client";

import React, {useMemo, useState} from "react";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import {SiMinutemailer} from "react-icons/si";
import {GiWaterBottle} from "react-icons/gi";
import {VscFeedback} from "react-icons/vsc";

import FeedbackDialog from "@/components/common/FeedbackDialog";
import {RequestDialog} from "@/components/common/RequestDialog";

export default function BasicSpeedDial() {
    const [openComplain, setOpenComplain] = useState(false);
    const [openRequest, setOpenRequest] = useState(false);
    const [dialOpen, setDialOpen] = useState(false);

    const actions = useMemo(
        () => [
            {
                key: "complain",
                icon: <GiWaterBottle/>,
                name: "Yêu cầu",
                onClick: () => setOpenComplain(true),
            },
            {
                key: "request",
                icon: <VscFeedback/>,
                name: "Phản hồi",
                onClick: () => setOpenRequest(true),
            },
        ],
        []
    );

    const handleActionClick = (fn: () => void) => {
        // đóng dial trước để UI không bị “đè/giật”
        setDialOpen(false);
        // mở dialog sau 1 tick nhỏ
        requestAnimationFrame(() => fn());
    };

    return (
        <>
            {/* fixed bottom-right, không phá layout */}
            <Box
                sx={{
                    position: "fixed",
                    bottom: 16,
                    right: 16,
                    zIndex: 50,
                    transform: "translateZ(0px)",
                }}
            >
                <SpeedDial
                    ariaLabel="Support actions"
                    icon={<SiMinutemailer/>}
                    open={dialOpen}
                    onOpen={() => setDialOpen(true)}
                    onClose={() => setDialOpen(false)}
                    direction="up"
                    sx={{
                        "& .MuiFab-root": {
                            backgroundColor: "#4F966C",
                            color: "#fff",
                            "&:hover": {backgroundColor: "#64B76A"},
                        },
                        "& .MuiSpeedDialAction-fab": {
                            backgroundColor: "#ffffff",
                            color: "#2f6b4a",
                            border: "1px solid rgba(47,107,74,0.15)",
                            "&:hover": {backgroundColor: "#F3FBF6"},
                        },
                    }}
                >
                    {actions.map((action) => (
                        <SpeedDialAction
                            key={action.key}
                            icon={action.icon}
                            tooltipTitle={action.name}
                            tooltipOpen
                            onClick={() => handleActionClick(action.onClick)}
                        />
                    ))}
                </SpeedDial>
            </Box>

            {/* Dialogs */}
            <FeedbackDialog isOpen={openComplain} onClose={() => setOpenComplain(false)}/>

            <RequestDialog open={openRequest} onClose={() => setOpenRequest(false)}/>
        </>
    );
}
