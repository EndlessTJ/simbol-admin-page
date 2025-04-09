import { Select, SelectProps, Spin } from "antd";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import {PartnerChannelType} from "@/type";
import { debounce } from "lodash";


export interface OptionsType {
  label: string;
  value: string;
}

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<OptionsType[]>;
  initOptions?: OptionsType[];
  debounceTimeout?: number;
}

const DebounceSelect: FC<DebounceSelectProps<PartnerChannelType>>  = ({ fetchOptions, initOptions = [],  debounceTimeout = 800, ...props }) => {
  const [options, setOptions] = useState<OptionsType[]>();
  const [fetching, setFetching] = useState(false);
  const fetchRef = useRef(0);
  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  return <Select
    // labelInValue
    filterOption={false}
    onSearch={debounceFetcher}
    notFoundContent={fetching ? <Spin size="small" /> : null}
    {...props}
    options={options?.length ? options : initOptions}
  />
}

export default DebounceSelect;