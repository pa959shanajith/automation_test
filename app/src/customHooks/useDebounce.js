import {useEffect, useState} from 'react';

const useDebounce = (value = "", delay = 500) => {
    const [searchValue, setSearchValue] = useState(value);

    useEffect(() => {
        const debounce = setTimeout(() => {
            setSearchValue(value);
        }, delay);

        return () => clearTimeout(debounce);
    }, [value, delay]);

    return searchValue;
}

export default useDebounce;