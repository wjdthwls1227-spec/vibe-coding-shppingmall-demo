import { createContext, useContext, useMemo, useReducer } from 'react';

const CartStateContext = createContext(null);
const CartDispatchContext = createContext(null);

const initialState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items || [],
        totalQuantity:
          action.payload.totalQuantity !== undefined
            ? action.payload.totalQuantity
            : state.totalQuantity,
        totalPrice:
          action.payload.totalPrice !== undefined ? action.payload.totalPrice : state.totalPrice,
      };
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const stateValue = useMemo(() => state, [state]);
  const dispatchValue = useMemo(() => dispatch, [dispatch]);

  return (
    <CartStateContext.Provider value={stateValue}>
      <CartDispatchContext.Provider value={dispatchValue}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
}

export function useCartState() {
  const context = useContext(CartStateContext);
  if (context === null) {
    throw new Error('useCartState는 CartProvider 내에서 사용해야 합니다.');
  }
  return context;
}

export function useCartDispatch() {
  const context = useContext(CartDispatchContext);
  if (context === null) {
    throw new Error('useCartDispatch는 CartProvider 내에서 사용해야 합니다.');
  }
  return context;
}



