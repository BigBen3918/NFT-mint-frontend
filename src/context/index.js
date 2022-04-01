import React, {
    createContext,
    useContext,
    useReducer,
    useMemo
} from "react";
const BlockchainContext = createContext();

export function useBlockchainContext() {
    return useContext(BlockchainContext);
}

function reducer(state, { type, payload }) {
    return {
        ...state,
        [type]: payload,
    };
}

const INIT_STATE = {
};

export default function Provider({ children }) {
    const [state, dispatch] = useReducer(reducer, INIT_STATE);
    
    return (
        <BlockchainContext.Provider
            value={useMemo(
                () => [
                    state,
                    {
                        /* buy */
                    }
                ],
                [state]
            )}>
            {children}
        </BlockchainContext.Provider>
    );
}
