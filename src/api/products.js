/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
import {
  withToken,
  groupFetchJson,
  makeConfig,
  toUrl,
  baseUrl,
} from "./api";
import config from "../../sunrise.config";
import { locale } from "../components/common/shared";

const asAttribute = (name, type, locale) => {
  if (type === "lnum") {
    return `variants.attributes.${name}.label.${locale}`;
  }
  if (type === "enum") {
    return `variants.attributes.${name}.key`;
  }
  return `variants.attributes.${name}`;
};

// The array of attributes is in config, there are many searchable
//  attributes but only a couple of them will display in UI
//  this will turn { designer: ['rebel', 'havaianas'] }; into
//  {"filter.query":["variants.attributes.designer.key:\"rebel\",\"havaianas\""]}
//  when 'designer' is the value of the name property of one of the items in
//  vueConfig.facetSearches
const facets = (query = {}, locale) =>
  config.facetSearches.reduce((result, { name, type }) => {
    // eslint-disable-next-line no-prototype-builtins
    if (query.hasOwnProperty(name)) {
      result["filter.query"] = result["filter.query"] || [];
      result["filter.query"].push(
        `${asAttribute(name, type, locale)}:${
          Array.isArray(query[name])
            ? query[name]
                .map((value) => `"${value}"`)
                .join(",")
            : `"${query[name]}"`
        }`
      );
    }
    return result;
  }, {});
const setCategory = ({ category, ...query }) =>
  category
    ? {
        ...query,
        "filter.query": `categories.id:subtree("${category}")`,
      }
    : query;

const products = {
  get: withToken(
    (
      [
        query,
        routeQuery,
        locale,
        totalFacets = config.facetSearches,
      ],
      accessToken
    ) => {
      query = setCategory(query);
      return Promise.all([
        groupFetchJson(
          toUrl(`${baseUrl}/product-projections/search`, [
            ...Object.entries(query)
              .filter(
                ([, val]) =>
                  !(val === null || val === undefined)
              )
              .map(([k, v]) => {
                if (k === "priceFilter") {
                  return ["filter.query", v];
                }
                return [k, v];
              }),
            ...Object.entries(facets(routeQuery, locale)),
            ...totalFacets.map(({ name, type }) => [
              "facet",
              `${asAttribute(
                name,
                type,
                locale
              )} counting products`,
            ]),
          ]),
          makeConfig(accessToken)
        ),
        config.facetSearches.reduce((result, item) => {
          result[item.name] = item.label;
          return result;
        }, {}),
      ]).then(([{ facets={}, ...result }, translation]) => ({
        ...result,
        facets: config.facetSearches.map(
          ({ name, type }) => {
            const facet =
              facets[asAttribute(name, type, locale)];
            return {
              ...facet,
              name,
              label: translation[name]?.[locale] || name,
              type,
              terms: [
                ...(facet?.terms || []),
              ].sort((a, b) =>
                a.term.localeCompare(b.term)
              ),
            };
          }
        ),
      }));
    }
  ),
  facets: (query, routeQuery, locale) => {
    query = {
      ...setCategory(query),
      page: 1,
      pageSize: 0,
    };
    return Promise.all(
      config.facetSearches.map(({ name, component }) => {
        const newRouteQuery = { ...routeQuery };
        delete newRouteQuery[name];
        return products
          .get([
            query,
            newRouteQuery,
            locale,
            config.facetSearches.filter(
              (f) => f.name === name
            ),
          ])
          .then(({ facets }) => ({
            ...facets.find((f) => f.name === name),
            component,
          }));
      })
    );
  },
  paramsFromComponent: (component) => {
    const category =
      component.$route.params.categorySlug === "all"
        ? undefined
        : component.categories?.results[0]?.id;
    const route = component.$route;
    const {
      currency,
      country,
      customerGroup,
      channel,
    } = component.$store.state;
    const priceChannel = channel?.id;
    const loc = locale(component);
    const sortValue = route.query.sort;
    const searchText = route.query.q
      ? { [`text.${loc}`]: route.query.q }
      : {};
    const sort = sortValue
      ? {
          sort: `lastModifiedAt ${
            sortValue === "newest" ? "desc" : "asc"
          }`,
        }
      : {};
    const { min, max } = route.query;
    const priceFilter = {};
    const minQ = min ? min * 100 : "0";
    const maxQ = max ? max * 100 : "100000000";
    priceFilter.priceFilter = `variants.scopedPrice.value.centAmount: range (${minQ} to ${maxQ})`;
    return {
      category,
      currency,
      country,
      customerGroup,
      priceChannel,
      loc,
      searchText,
      sort,
      priceFilter,
    };
  },
};

export default products;
