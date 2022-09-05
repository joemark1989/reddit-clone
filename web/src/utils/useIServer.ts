import React from "react";

export const useIsServer = () => {
    const [state, useState] = React.useState(Boolean)

    React.useEffect(() => {
        useState(typeof window === "undefined")
    }, [state])

    return state

}